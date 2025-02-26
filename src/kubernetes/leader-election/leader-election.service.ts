import { CoordinationV1Api, KubeConfig, V1Lease, V1MicroTime, Watch } from "@kubernetes/client-node"
import { Inject, Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from "@nestjs/common"
import { KUBECONFIG } from "../kubernetes.constants"
import { envConfig, runInKubernetes } from "@src/env"
import { MODULE_OPTIONS_TOKEN } from "../kubernetes.module-definition"
import { KubernetesOptions } from "../kubernetes.types"
import { v4 } from "uuid"
import { EventEmitter2 } from "@nestjs/event-emitter"
import {
    LEADER_ELECTED_EMITTER2_EVENT,
    LEADER_LOST_EMITTER2_EVENT
} from "./leader-election.constant"

@Injectable()
export class LeaderElectionService implements OnApplicationBootstrap, OnApplicationShutdown {
    private readonly logger = new Logger(LeaderElectionService.name)
    private readonly namespace: string
    private readonly leaseName: string
    private readonly holderIdentity: string
    private readonly renewInterval: number
    private leaseRenewalTimeout: NodeJS.Timeout | null = null
    private readonly durationInSeconds: number
    private coordintationV1Api: CoordinationV1Api
    private isLeader: boolean
    private watch: Watch
    private readonly awaitLeadership: boolean
    private readonly useMinikubeForDevelopment: boolean
    private kubernetesConnected = false

    constructor(
        @Inject(KUBECONFIG)
        private readonly kubeConfig: KubeConfig,
        @Inject(MODULE_OPTIONS_TOKEN)
        private readonly options: KubernetesOptions,
        private readonly eventEmitter: EventEmitter2
    ) {
        this.namespace = runInKubernetes() ? envConfig().kubernetes.namespace : "default"
        this.leaseName = this.options.leaderElection.leaseName
        this.holderIdentity = envConfig().kubernetes.hostname || v4()
        this.renewInterval = this.options.leaderElection?.renewInterval ?? 10000
        this.durationInSeconds = 2 * (this.renewInterval / 1000)
        this.awaitLeadership = this.options.leaderElection?.awaitLeadership ?? true
        this.isLeader = false
        this.useMinikubeForDevelopment =
            this.options.leaderElection &&
            (this.options.leaderElection.useMinikubeForDevelopment ?? true)
    }

    onApplicationShutdown(signal?: string) {
        this.logger.debug(`Application is shutting down with signal: ${signal}`)
        if (this.kubernetesConnected) {
            this.gracefulShutdown()
        }
    }

    async onApplicationBootstrap() {
        console.log(!this.useMinikubeForDevelopment, !runInKubernetes())
        if (!this.useMinikubeForDevelopment && !runInKubernetes()) {
            this.logger.debug("Leader election is disabled for non-kubernetes environments.")
            this.isLeader = true
            this.emitLeaderElectedEvent()
            return
        }
        try {
            this.coordintationV1Api = this.kubeConfig.makeApiClient(CoordinationV1Api)
            this.watch = new Watch(this.kubeConfig)
            this.kubernetesConnected = true
        }
        catch (error) {
            this.logger.error(`Error while creating kubernetes client: ${error.message}`)
            this.logger.debug("Leader election is disabled for non-kubernetes environments.")
            this.isLeader = true
            this.emitLeaderElectedEvent()
            return
        }
        this.watchLeaseObject() // This should start right away to catch any events.

        if (this.awaitLeadership) {
            // If awaitLeadership is true, block until leader election is complete.
            await this.runLeaderElectionProcess()
        } else {
            // Otherwise, run the leader election process in the background.
            this.runLeaderElectionProcess().catch((error) => {
                this.logger.error(`Error while running leader election process: ${error.message}`)
            })
        }
    }

    //get lease, if it existed, create a new one
    private async getLease(): Promise<V1Lease> {
        try {
            const { body } = await this.coordintationV1Api.readNamespacedLease(
                this.leaseName,
                this.namespace
            )
            return body
        } catch (error) {
            if (error.response && error.response.statusCode === 404) {
                return this.createLease()
            }
            this.logger.error("Error getting lease", error.message)
            throw error
        }
    }

    private async createLease(): Promise<V1Lease> {
        try {
            const { body } = await this.coordintationV1Api.createNamespacedLease(this.namespace, {
                metadata: {
                    name: this.leaseName,
                    namespace: this.namespace
                },
                spec: {
                    holderIdentity: this.holderIdentity,
                    leaseDurationSeconds: this.durationInSeconds,
                    acquireTime: new V1MicroTime(new Date()),
                    renewTime: new V1MicroTime(new Date())
                }
            })
            this.logger.debug("Lease created")
            return body
        } catch (error) {
            this.logger.error("Error creating lease", error.message)
            throw error
        }
    }

    // check if the lease is expired
    private isLeaseExpired(lease: V1Lease): boolean {
        const renewTime = lease.spec.renewTime ? new Date(lease.spec.renewTime).getTime() : 0
        const leaseDurationMs = (lease.spec.leaseDurationSeconds || this.durationInSeconds) * 1000
        return Date.now() > renewTime + leaseDurationMs
    }

    // check if the lease is held by us
    private isLeaseHeldByUs(lease: V1Lease): boolean {
        return lease.spec.holderIdentity === this.holderIdentity
    }

    private async gracefulShutdown() {
        this.logger.debug("Graceful shutdown initiated")
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
                await this.coordintationV1Api.replaceNamespacedLease(
                    this.leaseName,
                    this.namespace,
                    lease
                )
                this.logger.debug(`Lease for ${this.leaseName} released.`)
            }
        } catch (error) {
            this.logger.error({ message: "Failed to release lease", error })
        }
    }

    private async acquireLease(lease: V1Lease): Promise<V1Lease> {
        // Set this instance as the holder of the lease
        lease.spec.holderIdentity = this.holderIdentity
        lease.spec.leaseDurationSeconds = this.durationInSeconds
        lease.spec.acquireTime = new V1MicroTime(new Date())
        lease.spec.renewTime = new V1MicroTime(new Date())

        try {
            const { body } = await this.coordintationV1Api.replaceNamespacedLease(
                this.leaseName,
                this.namespace,
                lease
            )
            this.logger.debug("Successfully acquired lease")
            return body
        } catch (error) {
            this.logger.error({ message: "Error while acquiring lease", error })
            throw error
        }
    }

    // renew lease
    private async renewLease() {
        try {
            const lease = await this.getLease()
            if (this.isLeaseHeldByUs(lease)) {
                this.logger.debug("Renewing lease...")
                lease.spec.renewTime = new V1MicroTime(new Date())
                try {
                    const { body } = await this.coordintationV1Api.replaceNamespacedLease(
                        this.leaseName,
                        this.namespace,
                        lease
                    )
                    this.logger.debug("Successfully renewed lease")
                    return body
                } catch (error) {
                    this.logger.error(`Error renewing lease: ${error.message}`)
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

    // lose the leadership
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

    private emitLeadershipLostEvent() {
        this.eventEmitter.emit(LEADER_LOST_EMITTER2_EVENT, { leaseName: this.leaseName })
        this.logger.debug(`Instance lost the leadership for lease: ${this.leaseName}`)
    }

    private async tryToBecomeLeader() {
        this.logger.debug("Trying to become leader...")
        try {
            let lease: V1Lease = await this.getLease()
            if (this.isLeaseExpired(lease) || !lease.spec.holderIdentity) {
                this.logger.debug("Lease expired or not held. Attempting to become leader...")
                lease = await this.acquireLease(lease)
            }
            if (this.isLeaseHeldByUs(lease)) {
                this.becomeLeader()
            } else {
                this.logger.debug("Try to become leader failed. Trying again...")
            }
        } catch (error) {
            this.logger.error(`Error while trying to become leader: ${error.message}`)
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
        }, this.renewInterval)
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
                    error
                })
            })
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
                        this.logger.debug(`Watch event type: ${type} for lease: ${this.leaseName}`)
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
                            error: err
                        })
                    } else {
                        this.logger.debug("Watch for lease gracefully closed")
                    }
                    // Restart the watch after a delay
                    setTimeout(() => this.watchLeaseObject(), 5000)
                }
            )
        } catch (err) {
            this.logger.error(`Failed to start watch for lease: ${err}, trying again in 5 seconds`)
            // Retry starting the watch after a delay
            setTimeout(() => this.watchLeaseObject(), 5000)
        }
    }

    private becomeLeader() {
        this.isLeader = true
        this.emitLeaderElectedEvent()
        this.scheduleLeaseRenewal()
    }

    private emitLeaderElectedEvent() {
        this.eventEmitter.emit(LEADER_ELECTED_EMITTER2_EVENT, { leaseName: this.leaseName })
        this.logger.debug(`Instance became the leader for lease: ${this.leaseName}`)
    }

    private async runLeaderElectionProcess() {
        // Attempt to become a leader.
        await this.tryToBecomeLeader()

        // If not successful, retry up to two more times.
        for (let attempt = 0; attempt < 2; attempt++) {
            if (this.isLeader) break // Break early if leadership is acquired.

            // Wait for half the lease duration before retrying.
            await new Promise((resolve) => setTimeout(resolve, this.durationInSeconds * 500))

            // Try to become the leader again.
            await this.tryToBecomeLeader()
        }
    }
}
