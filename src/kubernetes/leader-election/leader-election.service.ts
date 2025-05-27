import { Inject, Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common"
import { CoordinationV1Api, KubeConfig, V1Lease, V1MicroTime, Watch } from "@kubernetes/client-node"
import { EventEmitter2, EventEmitterReadinessWatcher } from "@nestjs/event-emitter"
import { KubernetesOptions } from "../kubernetes.types"
import { LEADER_ELECTED_EMITTER2_EVENT, LEADER_LOST_EMITTER2_EVENT } from "./leader-election.constant"
import { MODULE_OPTIONS_TOKEN } from "../kubernetes.module-definition"

@Injectable()
export class LeaderElectionService implements OnApplicationBootstrap {
    private readonly logger = new Logger(LeaderElectionService.name)
    private kubeClient: CoordinationV1Api
    private watch: Watch
    private readonly leaseName: string
    private readonly namespace: string
    private readonly renewalInterval: number
    private readonly durationInSeconds: number
    private isLeader = false
    private readonly logAtLevel: "log" | "debug"
    private leaseRenewalTimeout: NodeJS.Timeout | null = null
    private readonly awaitLeadership: boolean
    LEADER_IDENTITY = `nestjs-${process.env.HOSTNAME}`

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
        this.durationInSeconds = 2 * (this.renewalInterval / 1000)
        this.logAtLevel = options.logAtLevel ?? "log"
        this.awaitLeadership = options.awaitLeadership ?? false

        process.on("SIGINT", () => this.gracefulShutdown())
        process.on("SIGTERM", () => this.gracefulShutdown())
    }

    async onApplicationBootstrap() {
        if (!process.env.KUBERNETES_SERVICE_HOST) {
            this.logger[this.logAtLevel](
                "Not running in Kubernetes, assuming leadership...",
            )
            this.isLeader = true
            this.emitLeaderElectedEvent()
        } else {
            this.watchLeaseObject() // This should start right away to catch any events.

            if (this.awaitLeadership) {
                // If awaitLeadership is true, block until leader election is complete.
                await this.runLeaderElectionProcess()
            } else {
                // Otherwise, run the leader election process in the background.
                this.runLeaderElectionProcess().catch((error) => {
                    this.logger.error({
                        message: "Leader election process failed",
                        error,
                    })
                })
            }
        }
    }

    private async runLeaderElectionProcess() {
    // Attempt to become a leader.
        await this.tryToBecomeLeader()

        // If not successful, retry up to two more times.
        for (let attempt = 0; attempt < 2; attempt++) {
            if (this.isLeader) break // Break early if leadership is acquired.

            // Wait for half the lease duration before retrying.
            await new Promise((resolve) =>
                setTimeout(resolve, this.durationInSeconds * 500),
            )

            // Try to become the leader again.
            await this.tryToBecomeLeader()
        }
    }

    private async tryToBecomeLeader() {
        this.logger[this.logAtLevel]("Trying to become leader...")
        try {
            let lease: V1Lease = await this.getLease()
            if (this.isLeaseExpired(lease) || !lease.spec.holderIdentity) {
                this.logger[this.logAtLevel](
                    "Lease expired or not held. Attempting to become leader...",
                )
                lease = await this.acquireLease(lease)
            }
            if (this.isLeaseHeldByUs(lease)) {
                this.becomeLeader()
            }
        } catch (error) {
            this.logger.error({
                message: "Error while trying to become leader",
                error,
            })
        }
    }

    private async acquireLease(lease: V1Lease): Promise<V1Lease> {
    // Set this instance as the holder of the lease
        lease.spec.holderIdentity = this.LEADER_IDENTITY
        lease.spec.leaseDurationSeconds = this.durationInSeconds
        lease.spec.acquireTime = new V1MicroTime(new Date())
        lease.spec.renewTime = new V1MicroTime(new Date())

        const params = { name: this.leaseName, namespace: this.namespace, body: lease }

        try {
            const body = await this.kubeClient.replaceNamespacedLease(params)
            this.logger[this.logAtLevel]("Successfully acquired lease")
            return body
        } catch (error) {
            this.logger.error({ message: "Error while acquiring lease", error })
            throw error
        }
    }

    private async renewLease() {
        try {
            const lease: V1Lease = await this.getLease()
            if (this.isLeaseHeldByUs(lease)) {
                this.logger[this.logAtLevel]("Renewing lease...")
                lease.spec.renewTime = new V1MicroTime(new Date())
                const body = await this.kubeClient.replaceNamespacedLease({ name: this.leaseName, namespace: this.namespace, body: lease })
                this.logger[this.logAtLevel]("Successfully renewed lease")
                return body
            } else {
                this.loseLeadership()
            }
        } catch (error) {
            this.logger.error({ message: "Error while renewing lease", error })
            this.loseLeadership()
        }
    }

    private async getLease(): Promise<V1Lease> {
        try {
            return await this.kubeClient.readNamespacedLease({ name: this.leaseName, namespace: this.namespace })
        } catch (error) {
            if (error.response && error.response.statusCode === 404) {
                this.logger[this.logAtLevel]("Lease not found. Creating lease...")
                return this.createLease()
            } else {
                throw error
            }
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

        try {
            const body = await this.kubeClient.createNamespacedLease({ namespace: this.namespace, body: lease })
            this.logger[this.logAtLevel]("Successfully created lease")
            return body
        } catch (error) {
            this.logger.error({ message: "Failed to create lease", error })
            throw error
        }
    }

    private isLeaseExpired(lease: V1Lease): boolean {
        const renewTime = lease.spec.renewTime
            ? new Date(lease.spec.renewTime).getTime()
            : 0
        const leaseDurationMs =
      (lease.spec.leaseDurationSeconds || this.durationInSeconds) * 1000
        return Date.now() > renewTime + leaseDurationMs
    }

    private isLeaseHeldByUs(lease: V1Lease): boolean {
        return lease.spec.holderIdentity === this.LEADER_IDENTITY
    }

    private async gracefulShutdown() {
        this.logger[this.logAtLevel]("Graceful shutdown initiated")
        if (this.isLeader) {
            await this.releaseLease()
        }
    }

    private async releaseLease(): Promise<void> {
        try {
            const lease = await this.getLease()
            if (lease && this.isLeaseHeldByUs(lease)) {
                lease.spec.holderIdentity = null
                lease.spec.renewTime = null
                await this.kubeClient.replaceNamespacedLease({
                    name: this.leaseName,
                    namespace: this.namespace,
                    body: lease,
                })
                this.logger[this.logAtLevel](`Lease for ${this.leaseName} released.`)
            }
        } catch (error) {
            this.logger.error({ message: "Failed to release lease", error })
        }
    }

    private async emitLeaderElectedEvent() {
        await this.eventEmitterReadinessWatcher.waitUntilReady()
        this.eventEmitter.emit(LEADER_ELECTED_EMITTER2_EVENT, { leaseName: this.leaseName })
        this.logger[this.logAtLevel](
            `Instance became the leader for lease: ${this.leaseName}`,
        )
    }

    private async emitLeadershipLostEvent() {
        await this.eventEmitterReadinessWatcher.waitUntilReady() 
        this.eventEmitter.emit(LEADER_LOST_EMITTER2_EVENT, { leaseName: this.leaseName })
        this.logger[this.logAtLevel](
            `Instance lost the leadership for lease: ${this.leaseName}`,
        )
    }

    private becomeLeader() {
        this.isLeader = true
        this.emitLeaderElectedEvent()
        this.scheduleLeaseRenewal()
    }

    private loseLeadership() {
        if (this.isLeader) {
            this.isLeader = false
            if (this.leaseRenewalTimeout) {
                clearTimeout(this.leaseRenewalTimeout)
                this.leaseRenewalTimeout = null
            }
            this.emitLeadershipLostEvent()
        }
    }

    private async watchLeaseObject() {
        const path = `/apis/coordination.k8s.io/v1/namespaces/${this.namespace}/leases`
        try {
            await this.watch.watch(
                path,
                {},
                (type, apiObj) => {
                    if (apiObj && apiObj.metadata.name === this.leaseName) {
                        this.logger[this.logAtLevel](
                            `Watch event type: ${type} for lease: ${this.leaseName}`,
                        )
                        switch (type) {
                        case "ADDED":
                        case "MODIFIED":
                            setTimeout(() => this.handleLeaseUpdate(apiObj), 2000)
                            break
                        case "DELETED":
                            setTimeout(() => this.handleLeaseDeletion(), 2000)
                            break
                        }
                    }
                },
                (err) => {
                    if (err) {
                        this.logger.error({
                            message: `Watch for lease ended with error: ${err}, trying again in 5 seconds`,
                            error: err,
                        })
                    } else {
                        this.logger[this.logAtLevel]("Watch for lease gracefully closed")
                    }
                    // Restart the watch after a delay
                    setTimeout(() => this.watchLeaseObject(), 5000)
                },
            )
        } catch (err) {
            this.logger.error(
                `Failed to start watch for lease: ${err}, trying again in 5 seconds`,
            )
            // Retry starting the watch after a delay
            setTimeout(() => this.watchLeaseObject(), 5000)
        }
    }

    private scheduleLeaseRenewal() {
    // Clear any existing lease renewal timeout.
        if (this.leaseRenewalTimeout) {
            clearTimeout(this.leaseRenewalTimeout)
        }

        // Schedule the lease renewal to happen at the renewalInterval.
        // The renewal should occur before the lease duration expires.
        this.leaseRenewalTimeout = setTimeout(async () => {
            if (this.isLeader) {
                try {
                    await this.renewLease()
                } catch (error) {
                    this.logger.error({ message: "Error while renewing lease", error })
                    // If lease renewal fails, consider handling it by attempting to re-acquire leadership or similar.
                }
            }
        }, this.renewalInterval)
    }

    private handleLeaseUpdate(leaseObj: V1Lease) {
        if (this.isLeaseHeldByUs(leaseObj)) {
            if (!this.isLeader) {
                setTimeout(() => {
                    this.becomeLeader()
                }, 2000) // Wait for 2 seconds before becoming the leader
            }
            this.scheduleLeaseRenewal()
        } else if (this.isLeader) {
            this.loseLeadership()
        }
    }

    private handleLeaseDeletion() {
        if (!this.isLeader) {
            this.tryToBecomeLeader().catch((error) => {
                this.logger.error({
                    message: "Error while trying to become leader after lease deletion",
                    error,
                })
            })
        }
    }
}