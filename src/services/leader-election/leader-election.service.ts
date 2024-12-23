
import {
    Injectable,
    Logger,
    OnApplicationBootstrap,
    Inject,
} from "@nestjs/common"
import {
    KubeConfig,
    CoordinationV1Api,
    V1Lease,
    Watch,
    V1MicroTime,
} from "@kubernetes/client-node"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { LEADER_ELECTION_OPTIONS, LeaderElectionOptions, LEADERSHIP_ELECTED_EVENT, LEADERSHIP_LOST_EVENT } from "./leader-election.types"
import { envConfig } from "@src/config"
import { runInKubernetes } from "@src/utils"

@Injectable()
export class LeaderElectionService implements OnApplicationBootstrap {
    private readonly logger = new Logger(LeaderElectionService.name)
    
    private kubeClient: CoordinationV1Api
    private watch: Watch
    private leaseName: string
    private namespace: string
    private renewalInterval: number
    private durationInSeconds: number
    private isLeader = false
    private logAtLevel: "log" | "debug"
    private leaseRenewalTimeout: NodeJS.Timeout | null = null
    private awaitLeadership: boolean

    LEADER_IDENTITY = `nestjs-${envConfig().kubernetes.generated.hostname}`  // Unique identity for the leader

    public isLeaderInstance(): boolean {
        return this.isLeader
    }

    constructor(
        @Inject(LEADER_ELECTION_OPTIONS) private options: LeaderElectionOptions,
        private readonly eventEmitter: EventEmitter2
    ) {
        // Create a new instance of KubeConfig to load Kubernetes cluster configuration
        const kubeConfig = new KubeConfig()
        kubeConfig.loadFromDefault()  // Load the default configuration (from ~/.kube/config or in-cluster configuration)
        
        // Create a Kubernetes client for interacting with the Coordination V1 API (for leader election)
        this.kubeClient = kubeConfig.makeApiClient(CoordinationV1Api)
        
        // Initialize the Watch object to watch Kubernetes resources
        this.watch = new Watch(kubeConfig)
    
        // Set up the lease name with a fallback default value
        this.leaseName = options.leaseName ?? "nestjs-leader-election"  // Default lease name if not provided in options
    
        // Set up the Kubernetes namespace for the lease, defaulting to "default"
        this.namespace = envConfig().kubernetes.defined.namespace ?? "default"  // Default namespace if not provided
    
        // Set the renewal interval for the leader lease, defaulting to 10000 ms (10 seconds)
        this.renewalInterval = options.renewalInterval ?? 10000  // Default interval if not provided
    
        // Calculate the lease duration (in seconds) based on the renewal interval
        this.durationInSeconds = 2 * (this.renewalInterval / 1000)  // Twice the renewal interval in seconds (for the lease duration)
    
        // Set up the logging level, defaulting to "log"
        this.logAtLevel = options.logAtLevel ?? "log"  // Default to "log" level if not provided
    
        // Determine whether the application should block and wait for leadership to be acquired
        this.awaitLeadership = options.awaitLeadership ?? false  // Default to false if not provided
    
        // Set up graceful shutdown handlers for SIGINT (Ctrl + C) and SIGTERM (termination)
        process.on("SIGINT", () => this.gracefulShutdown())  // Handle SIGINT to gracefully shut down
        process.on("SIGTERM", () => this.gracefulShutdown())  // Handle SIGTERM to gracefully shut down
    }
  
    async onApplicationBootstrap() {
        // Check if the application is running inside a Kubernetes cluster
        if (!runInKubernetes()) {
            // If not running in Kubernetes, assume the current instance is the leader
            this.logger[this.logAtLevel](
                "Not running in Kubernetes, assuming leadership..."  // Log the information that it's not in Kubernetes
            )
            
            // Set the current instance as the leader
            this.isLeader = true
            
            // Emit an event indicating that the leader has been elected
            this.emitLeaderElectedEvent()
        } else {
            // If running inside Kubernetes, start watching the lease object (leader election resource)
            this.watchLeaseObject() // This should start immediately to watch lease changes
    
            // Check if we need to block the application until it becomes the leader
            if (this.awaitLeadership) {
                // If awaitLeadership is true, block execution and wait for the leader election to complete
                await this.runLeaderElectionProcess() // Wait until the leader election process completes
            } else {
                // If awaitLeadership is false, run the leader election process in the background
                this.runLeaderElectionProcess()
                    .catch((error) => {
                        // If there is an error in the leader election process, log the error
                        this.logger.error({
                            message: "Leader election process failed",  // Log a failure message
                            error,  // Include the error details in the log
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
                setTimeout(resolve, this.durationInSeconds * 500)
            )
  
            // Try to become the leader again.
            await this.tryToBecomeLeader()
        }
    }
  
    private async tryToBecomeLeader() {
        // Log an attempt to acquire leadership
        this.logger[this.logAtLevel]("Trying to become leader...")
    
        try {
            // Get the current lease object, which tracks the leader election
            let lease: V1Lease = await this.getLease()
            
            // Check if the lease has expired or is not held by anyone
            if (this.isLeaseExpired(lease) || !lease.spec.holderIdentity) {
                this.logger[this.logAtLevel](
                    "Lease expired or not held. Attempting to become leader..."
                )
                
                // If expired or not held, try to acquire the lease and become the leader
                lease = await this.acquireLease(lease)
            }
            
            // Check if the lease is held by the current instance (this instance is the leader)
            if (this.isLeaseHeldByUs(lease)) {
                this.becomeLeader()  // If the lease is held by us, mark this instance as the leader
            }
        } catch (error) {
            // If any error occurs while trying to become leader, log it
            this.logger.error({
                message: "Error while trying to become leader",  // Custom error message
                error,  // Log the error details for debugging
            })
        }
    }
  
    private async acquireLease(lease: V1Lease): Promise<V1Lease> {
        // Set this instance as the holder of the lease
        lease.spec.holderIdentity = this.LEADER_IDENTITY
        lease.spec.leaseDurationSeconds = this.durationInSeconds
        lease.spec.acquireTime = new V1MicroTime(new Date())
        lease.spec.renewTime = new V1MicroTime(new Date())
  
        try {
            const replacedLease = await this.kubeClient.replaceNamespacedLease(
                {
                    name : this.leaseName,
                    namespace : this.namespace,
                    body : lease
                }
            )
            this.logger[this.logAtLevel]("Successfully acquired lease")
            return replacedLease
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
                try {
                    const replacedLease = await this.kubeClient.replaceNamespacedLease(
                        {
                            name : this.leaseName,
                            namespace : this.namespace,
                            body : lease
                        }
                    )
                    this.logger[this.logAtLevel]("Successfully renewed lease")
                    return replacedLease
                } catch (error) {
                    this.logger.error({ message: "Error while renewing lease", error })
                    throw error
                }
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
            const lease = await this.kubeClient.readNamespacedLease(
                {
                    name : this.leaseName,
                    namespace : this.namespace
                }
            )
            return lease
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
            const createdLease = await this.kubeClient.createNamespacedLease(
                {
                    namespace : this.namespace,
                    body : lease
                }
            )
            this.logger[this.logAtLevel]("Successfully created lease")
            return createdLease
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
                await this.kubeClient.replaceNamespacedLease(
                    {
                        name : this.leaseName,
                        namespace : this.namespace,
                        body : lease
                    }
                )
                this.logger[this.logAtLevel](`Lease for ${this.leaseName} released.`)
            }
        } catch (error) {
            this.logger.error({ message: "Failed to release lease", error })
        }
    }
  
    private emitLeaderElectedEvent() {
        this.eventEmitter.emit(LEADERSHIP_ELECTED_EVENT, { leaseName: this.leaseName })
        this.logger[this.logAtLevel](
            `Instance became the leader for lease: ${this.leaseName}`
        )
    }
  
    private emitLeadershipLostEvent() {
        this.eventEmitter.emit(LEADERSHIP_LOST_EVENT, { leaseName: this.leaseName })
        this.logger[this.logAtLevel](
            `Instance lost the leadership for lease: ${this.leaseName}`
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
                            `Watch event type: ${type} for lease: ${this.leaseName}`
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
                }
            )
        } catch (err) {
            this.logger.error(
                `Failed to start watch for lease: ${err}, trying again in 5 seconds`
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
