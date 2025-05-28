import { Inject, Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from "@nestjs/common"
import { CoordinationV1Api, KubeConfig, V1Lease, V1MicroTime, Watch } from "@kubernetes/client-node"
import { EventEmitter2, EventEmitterReadinessWatcher } from "@nestjs/event-emitter"
import { KubernetesOptions } from "../kubernetes.types"
import { LEADER_ELECTED_EMITTER2_EVENT, LEADER_LOST_EMITTER2_EVENT } from "./leader-election.constant"
import { MODULE_OPTIONS_TOKEN } from "../kubernetes.module-definition"

interface LeaderElectionMetrics {
    leadershipAcquisitions: number
    leadershipLosses: number
    failedRenewals: number
    watchReconnections: number
    lastLeadershipChange: Date | null
    currentLeadershipDuration: number
    apiCallLatency: number
    circuitBreakerTrips: number
}

@Injectable()
export class LeaderElectionService implements OnApplicationBootstrap, OnApplicationShutdown {
    private readonly logger = new Logger(LeaderElectionService.name)
    private kubeClient: CoordinationV1Api
    private watch: Watch
    private readonly leaseName: string
    private readonly namespace: string
    private readonly renewalInterval: number
    private readonly durationInSeconds: number
    private readonly maxRetries: number
    private readonly baseDelay: number
    private readonly maxDelay: number
    private readonly watchHealthTimeout: number
    private isLeader = false
    private readonly logAtLevel: "log" | "debug" | "warn"
    private leaseRenewalInterval: NodeJS.Timeout | null = null
    private readonly awaitLeadership: boolean
    private watcherActive = false
    private lastWatchEvent = Date.now()
    private watchCheckInterval: NodeJS.Timeout | null = null
    private readonly LEADER_IDENTITY: string
    private watchAbortController: AbortController | null = null
    private isShuttingDown = false
    private readonly metrics: LeaderElectionMetrics = {
        leadershipAcquisitions: 0,
        leadershipLosses: 0,
        failedRenewals: 0,
        watchReconnections: 0,
        lastLeadershipChange: null,
        currentLeadershipDuration: 0,
        apiCallLatency: 0,
        circuitBreakerTrips: 0
    }
    private leadershipStartTime: Date | null = null
    private circuitBreakerFailures = 0
    private readonly maxCircuitBreakerFailures: number
    private circuitBreakerResetTime: Date | null = null
    private readonly circuitBreakerTimeout: number
    private currentLeaseResourceVersion: string | undefined

    constructor(
        @Inject(MODULE_OPTIONS_TOKEN) private _options: KubernetesOptions,
        private readonly eventEmitterReadinessWatcher: EventEmitterReadinessWatcher,
        private readonly eventEmitter: EventEmitter2,
    ) {
        const kubeConfig = new KubeConfig()
        kubeConfig.loadFromDefault()
        this.kubeClient = kubeConfig.makeApiClient(CoordinationV1Api)
        this.watch = new Watch(kubeConfig)
        const options = this._options.leaderElection
        this.leaseName = options.leaseName ?? "nestjs-leader-election"
        this.namespace = options.namespace ?? "default"
        this.renewalInterval = options.renewalInterval ?? 10000
        this.durationInSeconds = Math.max(2 * (this.renewalInterval / 1000), 15) // Minimum 15 seconds
        this.maxRetries = options.maxRetries ?? 3
        this.baseDelay = options.baseDelay ?? 500
        this.maxDelay = options.maxDelay ?? this.renewalInterval
        this.watchHealthTimeout = options.watchHealthTimeout ?? this.renewalInterval * 3
        this.logAtLevel = options.logAtLevel ?? "log"
        this.awaitLeadership = options.awaitLeadership ?? false
        this.maxCircuitBreakerFailures = options.maxCircuitBreakerFailures ?? 5
        this.circuitBreakerTimeout = options.circuitBreakerTimeout ?? 30000

        // Sanitize hostname to prevent injection attacks
        this.LEADER_IDENTITY = this.generateSecureLeaderIdentity()

        // Validate configuration
        this.validateConfiguration()

        // Graceful shutdown handlers
        process.on("SIGINT", () => this.initiateGracefulShutdown())
        process.on("SIGTERM", () => this.initiateGracefulShutdown())
        process.on("SIGQUIT", () => this.initiateGracefulShutdown())
    }

    private generateSecureLeaderIdentity(): string {
        const hostname = process.env.HOSTNAME || "unknown"
        // Sanitize hostname - only allow alphanumeric, hyphens, and dots
        const sanitizedHostname = hostname.replace(/[^a-zA-Z0-9.-]/g, "").substring(0, 63)
        const timestamp = Date.now()
        const randomSuffix = Math.random().toString(36).substring(2, 8)
        return `nestjs-${sanitizedHostname}-${timestamp}-${randomSuffix}`
    }

    private validateConfiguration(): void {
        if (this.renewalInterval < 1000) {
            throw new Error("renewalInterval must be at least 1000ms")
        }
        if (this.durationInSeconds < 10) {
            throw new Error("durationInSeconds must be at least 10 seconds")
        }
        if (this.maxRetries < 1) {
            throw new Error("maxRetries must be at least 1")
        }
        if (!this.leaseName.match(/^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/)) {
            throw new Error("leaseName must be a valid Kubernetes resource name")
        }
        if (!this.namespace.match(/^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/)) {
            throw new Error("namespace must be a valid Kubernetes namespace name")
        }
    }

    async onApplicationBootstrap() {
        if (!process.env.KUBERNETES_SERVICE_HOST) {
            this.logger[this.logAtLevel]("Not running in Kubernetes, assuming leadership...")
            this.isLeader = true
            this.leadershipStartTime = new Date()
            this.metrics.leadershipAcquisitions++
            this.metrics.lastLeadershipChange = this.leadershipStartTime
            await this.emitLeaderElectedEvent()
            return
        }

        try {
            // Validate RBAC permissions before starting
            await this.validateRBACPermissions()
            
            // Start watch health monitoring
            this.watchCheckInterval = setInterval(() => this.checkWatchHealth(), this.renewalInterval * 2)
            
            await this.startWatcher()

            if (this.awaitLeadership) {
                await this.runLeaderElectionProcess()
            } else {
                this.runLeaderElectionProcess().catch((error) => {
                    this.logger.error("Leader election process failed", error.stack)
                })
            }
        } catch (error) {
            this.logger.error("Failed to bootstrap leader election", error.stack)
            throw error
        }
    }

    private async validateRBACPermissions(): Promise<void> {
        try {
            // Test if we can read leases in the namespace
            await this.kubeClient.listNamespacedLease({ namespace: this.namespace, limit: 1 })
            this.logger[this.logAtLevel]("RBAC validation passed - can read leases")
            
            // Test if we can create/update leases by attempting to read our specific lease
            try {
                await this.kubeClient.readNamespacedLease({
                    name: this.leaseName,
                    namespace: this.namespace,
                })
            } catch (error) {
                if (error.response?.statusCode === 404) {
                    // Lease doesn't exist, which is fine
                    this.logger[this.logAtLevel]("RBAC validation passed - lease not found (expected)")
                } else if (error.response?.statusCode === 403) {
                    throw new Error(`Insufficient RBAC permissions to read lease '${this.leaseName}' in namespace '${this.namespace}'`)
                } else {
                    throw error
                }
            }
        } catch (error) {
            if (error.response?.statusCode === 403) {
                throw new Error(`Insufficient RBAC permissions to list leases in namespace '${this.namespace}'. Required permissions: get, list, create, update leases in coordination.k8s.io/v1`)
            }
            throw error
        }
    }

    async onApplicationShutdown(signal?: string) {
        this.logger[this.logAtLevel](`Application shutdown initiated with signal: ${signal}`)
        await this.initiateGracefulShutdown()
    }

    private async initiateGracefulShutdown(): Promise<void> {
        if (this.isShuttingDown) return
        
        this.isShuttingDown = true
        this.logger[this.logAtLevel]("Graceful shutdown initiated")
        
        try {
            await this.cleanupResources()
        } catch (error) {
            this.logger.error("Error during cleanup", error.stack)
        }
    }

    private async cleanupResources(): Promise<void> {
        // Clear all timeouts and intervals
        if (this.leaseRenewalInterval) {
            clearInterval(this.leaseRenewalInterval)
            this.leaseRenewalInterval = null
        }

        if (this.watchCheckInterval) {
            clearInterval(this.watchCheckInterval)
            this.watchCheckInterval = null
        }

        // Abort watch connection
        if (this.watchAbortController) {    
            this.watchAbortController.abort()
            this.watchAbortController = null
        }
        this.watcherActive = false

        // Release lease if we're the leader
        if (this.isLeader) {
            try {
                await this.releaseLease()
            } catch (error) {
                this.logger.error("Failed to release lease during shutdown", error.stack)
            }
        }

        // Update metrics
        if (this.leadershipStartTime) {
            this.metrics.currentLeadershipDuration = Date.now() - this.leadershipStartTime.getTime()
        }
    }

    private isCircuitBreakerOpen(): boolean {
        if (this.circuitBreakerFailures < this.maxCircuitBreakerFailures) {
            return false
        }

        if (this.circuitBreakerResetTime && Date.now() > this.circuitBreakerResetTime.getTime()) {
            this.circuitBreakerFailures = 0
            this.circuitBreakerResetTime = null
            return false
        }

        return true
    }

    private recordCircuitBreakerFailure(): void {
        this.circuitBreakerFailures++
        if (this.circuitBreakerFailures >= this.maxCircuitBreakerFailures) {
            this.circuitBreakerResetTime = new Date(Date.now() + this.circuitBreakerTimeout)
            this.metrics.circuitBreakerTrips++
            this.logger.warn(`Circuit breaker opened due to ${this.circuitBreakerFailures} failures`)
        }
    }

    private recordCircuitBreakerSuccess(): void {
        if (this.circuitBreakerFailures > 0) {
            this.circuitBreakerFailures = 0
            this.circuitBreakerResetTime = null
        }
    }

    private async startWatcher(): Promise<void> {
        if (this.watcherActive || this.isShuttingDown) return

        if (this.isCircuitBreakerOpen()) {
            this.logger.warn("Circuit breaker is open, skipping watch start")
            setTimeout(() => this.startWatcher(), this.circuitBreakerTimeout)
            return
        }

        try {
            const path = `/apis/coordination.k8s.io/v1/namespaces/${this.namespace}/leases`
            
            this.watchAbortController = new AbortController()
            await this.watch.watch(
                path,
                {},
                (type, apiObj) => {
                    this.lastWatchEvent = Date.now()
                    
                    if (!apiObj || apiObj.metadata?.name !== this.leaseName) return

                    this.logger[this.logAtLevel](`Watch event: ${type} for lease ${this.leaseName}`)
                    
                    switch (type) {
                    case "ADDED":
                    case "MODIFIED":
                        this.handleLeaseUpdate(apiObj).catch(error => {
                            this.logger.error("Error handling lease update", error.stack)
                        })
                        break
                    case "DELETED":
                        this.handleLeaseDeletion().catch(error => {
                            this.logger.error("Error handling lease deletion", error.stack)
                        })
                        break
                    }
                },
                (err) => {
                    this.watcherActive = false
                    if (err && !this.isShuttingDown) {
                        this.logger.error(`Watch ended with error: ${err.message}`)
                        this.recordCircuitBreakerFailure()
                        this.metrics.watchReconnections++
                    }
                    
                    if (!this.isShuttingDown) {
                        const delay = this.isCircuitBreakerOpen() ? this.circuitBreakerTimeout : 5000
                        setTimeout(() => this.startWatcher(), delay)
                    }
                }
            )
            
            this.watcherActive = true
            this.recordCircuitBreakerSuccess()
        } catch (err) {
            this.logger.error(`Failed to start watch: ${err.message}`)
            this.recordCircuitBreakerFailure()
            
            if (!this.isShuttingDown) {
                const delay = this.isCircuitBreakerOpen() ? this.circuitBreakerTimeout : 5000
                setTimeout(() => this.startWatcher(), delay)
            }
        }
    }

    private checkWatchHealth(): void {
        if (this.isShuttingDown) return

        if (Date.now() - this.lastWatchEvent > this.watchHealthTimeout) {
            this.logger.warn("No watch events received recently, restarting watcher")
            if (this.watchAbortController) {
                this.watchAbortController.abort()
            }
            this.startWatcher()
        }
    }

    private async runLeaderElectionProcess(): Promise<void> {
        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
            if (this.isLeader || this.isShuttingDown) break

            try {
                await this.tryToBecomeLeader()
                if (this.isLeader) break
                
                // Exponential backoff with jitter
                const jitter = Math.random() * 0.1 * this.baseDelay
                const delay = Math.min(this.baseDelay * Math.pow(2, attempt) + jitter, this.maxDelay)
                await new Promise(resolve => setTimeout(resolve, delay))
            } catch (error) {
                this.logger.error(`Leader election attempt ${attempt + 1} failed`, error.stack)
                if (attempt === this.maxRetries - 1) {
                    throw error
                }
            }
        }
    }

    private async tryToBecomeLeader(): Promise<void> {
        if (this.isShuttingDown || this.isCircuitBreakerOpen()) return

        try {
            const lease = await this.withRetry(() => this.getLease())
            
            if (this.isLeaseExpired(lease)) {
                this.logger[this.logAtLevel]("Lease expired, attempting to become leader...")
                await this.acquireLease(lease)
            } else if (!lease.spec?.holderIdentity) {
                this.logger[this.logAtLevel]("Lease not held, attempting to become leader...")
                await this.acquireLease(lease)
            }

            if (this.isLeaseHeldByUs(lease)) {
                this.becomeLeader()
            }
        } catch (error) {
            this.logger.error("Error in tryToBecomeLeader", error.stack)
            throw error
        }
    }

    private async withRetry<T>(fn: () => Promise<T>, retries = this.maxRetries, delay = this.baseDelay): Promise<T> {
        const startTime = Date.now()
        try {
            const result = await fn()
            this.recordCircuitBreakerSuccess()
            this.metrics.apiCallLatency = Date.now() - startTime
            return result
        } catch (error) {
            this.recordCircuitBreakerFailure()
            this.metrics.apiCallLatency = Date.now() - startTime
            
            if (retries <= 0 || this.isShuttingDown) throw error
            
            const jitter = Math.random() * 0.1 * delay
            const actualDelay = Math.min(delay + jitter, this.maxDelay)
            await new Promise(resolve => setTimeout(resolve, actualDelay))
            return this.withRetry(fn, retries - 1, delay * 2)
        }
    }

    private async acquireLease(lease: V1Lease): Promise<V1Lease> {
        if (!lease.spec) lease.spec = {}
        
        lease.spec.holderIdentity = this.LEADER_IDENTITY
        lease.spec.leaseDurationSeconds = this.durationInSeconds
        lease.spec.acquireTime = new V1MicroTime(new Date())
        lease.spec.renewTime = new V1MicroTime(new Date())

        try {
            const response = await this.kubeClient.replaceNamespacedLease({
                name: this.leaseName,
                namespace: this.namespace,
                body: lease
            })
            
            // Store resource version for optimistic locking
            this.currentLeaseResourceVersion = response.metadata?.resourceVersion
            this.logger[this.logAtLevel]("Successfully acquired lease")
            return response
        } catch (error) {
            if (error.response?.statusCode === 409) {
                this.logger[this.logAtLevel]("Lease was modified concurrently")
                throw new Error("Concurrent modification")
            }
            throw error
        }
    }

    private async renewLease(): Promise<void> {
        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
            if (this.isShuttingDown) return

            try {
                const lease = await this.getLease()
                
                if (!this.isLeaseHeldByUs(lease)) {
                    this.loseLeadership()
                    return
                }

                // Optimistic locking check
                if (this.currentLeaseResourceVersion && 
                    lease.metadata?.resourceVersion !== this.currentLeaseResourceVersion) {
                    this.logger.warn("Lease resource version mismatch, potential concurrent modification")
                    this.loseLeadership()
                    return
                }

                lease.spec.renewTime = new V1MicroTime(new Date())
                const response = await this.kubeClient.replaceNamespacedLease({
                    name: this.leaseName,
                    namespace: this.namespace,
                    body: lease
                })
                
                // Update resource version
                this.currentLeaseResourceVersion = response.metadata?.resourceVersion
                this.logger[this.logAtLevel]("Successfully renewed lease")
                this.recordCircuitBreakerSuccess()
                return
            } catch (error) {
                this.logger.error(`Lease renewal attempt ${attempt + 1} failed`, error.stack)
                this.recordCircuitBreakerFailure()
                this.metrics.failedRenewals++
                
                if (attempt === this.maxRetries - 1) {
                    this.loseLeadership()
                    throw error
                }
                
                const delay = this.baseDelay * (attempt + 1)
                await new Promise(resolve => setTimeout(resolve, delay))
            }
        }
    }

    private async getLease(): Promise<V1Lease> {
        try {
            const response = await this.kubeClient.readNamespacedLease({
                name: this.leaseName,
                namespace: this.namespace,
            })
            return response
        } catch (error) {
            if (error.response?.statusCode === 404) {
                this.logger[this.logAtLevel]("Lease not found, creating new lease")
                return this.createLease()
            }
            throw error
        }
    }

    private async createLease(): Promise<V1Lease> {
        const lease = {
            metadata: {
                name: this.leaseName,
                namespace: this.namespace,
            },
            spec: {
                holderIdentity: this.LEADER_IDENTITY,
                leaseDurationSeconds: this.durationInSeconds,
                acquireTime: new V1MicroTime(new Date()),
                renewTime: new V1MicroTime(new Date()),
            },
        }

        const response = await this.kubeClient.createNamespacedLease({
            namespace: this.namespace,
            body: lease
        })
        
        // Store resource version for optimistic locking
        this.currentLeaseResourceVersion = response.metadata?.resourceVersion
        this.logger[this.logAtLevel]("Successfully created lease")
        return response
    }

    private isLeaseExpired(lease: V1Lease): boolean {
        if (!lease.spec?.renewTime) return true
        
        const renewTime = new Date(lease.spec.renewTime).getTime()
        const leaseDurationMs = (lease.spec.leaseDurationSeconds || this.durationInSeconds) * 1000
        return Date.now() > renewTime + leaseDurationMs
    }

    private isLeaseHeldByUs(lease: V1Lease): boolean {
        return lease.spec?.holderIdentity === this.LEADER_IDENTITY
    }

    private async releaseLease(): Promise<void> {
        try {
            const lease = await this.getLease()
            
            if (this.isLeaseHeldByUs(lease)) {
                // Clear holder identity instead of setting empty string for better semantics
                if (lease.spec) {
                    delete lease.spec.holderIdentity
                }
                await this.kubeClient.replaceNamespacedLease({
                    name: this.leaseName,
                    namespace: this.namespace,
                    body: lease
                })
                this.logger[this.logAtLevel]("Successfully released lease")
            }
        } catch (error) {
            this.logger.error("Failed to release lease", error.stack)
            // Don't throw here as this is called during shutdown
        }
    }

    private async emitLeaderElectedEvent(): Promise<void> {
        try {
            await this.eventEmitterReadinessWatcher.waitUntilReady()
            this.eventEmitter.emit(LEADER_ELECTED_EMITTER2_EVENT, { 
                leaseName: this.leaseName,
                identity: this.LEADER_IDENTITY
            })
            this.logger[this.logAtLevel](`Became leader for lease: ${this.leaseName}`)
        } catch (error) {
            this.logger.error("Failed to emit leader elected event", error.stack)
            throw error
        }
    }

    private async emitLeadershipLostEvent(): Promise<void> {
        try {
            await this.eventEmitterReadinessWatcher.waitUntilReady()
            this.eventEmitter.emit(LEADER_LOST_EMITTER2_EVENT, { 
                leaseName: this.leaseName,
                identity: this.LEADER_IDENTITY
            })
            this.logger[this.logAtLevel](`Lost leadership for lease: ${this.leaseName}`)
        } catch (error) {
            this.logger.error("Failed to emit leader lost event", error.stack)
        }
    }

    private becomeLeader(): void {
        if (this.isLeader || this.isShuttingDown) return
        
        this.isLeader = true
        this.leadershipStartTime = new Date()
        this.metrics.leadershipAcquisitions++
        this.metrics.lastLeadershipChange = this.leadershipStartTime
        
        this.emitLeaderElectedEvent().catch(error => {
            this.logger.error("Failed to emit leader elected event", error.stack)
            // Don't lose leadership just because event emission failed
        })
        this.scheduleLeaseRenewal()
    }

    private loseLeadership(): void {
        if (!this.isLeader) return
        
        this.isLeader = false
        this.metrics.leadershipLosses++
        this.metrics.lastLeadershipChange = new Date()
        
        if (this.leadershipStartTime) {
            this.metrics.currentLeadershipDuration = Date.now() - this.leadershipStartTime.getTime()
            this.leadershipStartTime = null
        }
        
        if (this.leaseRenewalInterval) {
            clearInterval(this.leaseRenewalInterval)
            this.leaseRenewalInterval = null
        }
        
        this.emitLeadershipLostEvent().catch(error => {
            this.logger.error("Failed to emit leader lost event", error.stack)
        })
    }

    private scheduleLeaseRenewal(): void {
        if (this.leaseRenewalInterval) {
            clearInterval(this.leaseRenewalInterval)
        }

        if (this.isShuttingDown) return

        // Use setInterval instead of recursive setTimeout to prevent memory leaks
        this.leaseRenewalInterval = setInterval(async () => {
            if (this.isLeader && !this.isShuttingDown) {
                try {
                    await this.renewLease()
                } catch (error) {
                    this.logger.error("Lease renewal failed", error.stack)
                    this.loseLeadership()
                }
            } else {
                // Clear interval if no longer leader
                if (this.leaseRenewalInterval) {
                    clearInterval(this.leaseRenewalInterval)
                    this.leaseRenewalInterval = null
                }
            }
        }, this.renewalInterval)
    }

    private async handleLeaseUpdate(leaseObj: V1Lease): Promise<void> {
        if (this.isShuttingDown) return

        try {
            if (this.isLeaseHeldByUs(leaseObj)) {
                if (!this.isLeader) {
                    // Additional validation before becoming leader
                    if (this.isLeaseExpired(leaseObj)) {
                        this.logger.warn("Received update for expired lease held by us, not becoming leader")
                        return
                    }
                    this.becomeLeader()
                }
            } else if (this.isLeader) {
                this.logger.warn("Lease is no longer held by us, losing leadership")
                this.loseLeadership()
            }
        } catch (error) {
            this.logger.error("Error handling lease update", error.stack)
        }
    }

    private async handleLeaseDeletion(): Promise<void> {
        if (!this.isLeader && !this.isShuttingDown) {
            await this.runLeaderElectionProcess()
        }
    }

    // Public methods for monitoring and health checks
    public isHealthy(): boolean {
        const now = Date.now()
        const watchHealthy = this.watcherActive && (now - this.lastWatchEvent) < this.watchHealthTimeout
        const circuitBreakerHealthy = !this.isCircuitBreakerOpen()
        const notShuttingDown = !this.isShuttingDown
        
        return notShuttingDown && watchHealthy && circuitBreakerHealthy
    }

    public getDetailedHealthStatus(): {
        healthy: boolean
        isLeader: boolean
        watcherActive: boolean
        lastWatchEventAge: number
        circuitBreakerOpen: boolean
        isShuttingDown: boolean
        metrics: LeaderElectionMetrics
        } {
        return {
            healthy: this.isHealthy(),
            isLeader: this.isLeader,
            watcherActive: this.watcherActive,
            lastWatchEventAge: Date.now() - this.lastWatchEvent,
            circuitBreakerOpen: this.isCircuitBreakerOpen(),
            isShuttingDown: this.isShuttingDown,
            metrics: this.getMetrics()
        }
    }

    public getMetrics(): LeaderElectionMetrics {
        if (this.isLeader && this.leadershipStartTime) {
            this.metrics.currentLeadershipDuration = Date.now() - this.leadershipStartTime.getTime()
        }
        return { ...this.metrics }
    }

    public getLeadershipStatus(): {
        isLeader: boolean
        identity: string
        leaseName: string
        namespace: string
        leadershipDuration: number
        } {
        return {
            isLeader: this.isLeader,
            identity: this.LEADER_IDENTITY,
            leaseName: this.leaseName,
            namespace: this.namespace,
            leadershipDuration: this.isLeader && this.leadershipStartTime 
                ? Date.now() - this.leadershipStartTime.getTime() 
                : 0
        }
    }
}