import { BaseOptions } from "@src/common"

export interface KubernetesOptions extends BaseOptions {
    leaderElection?: LeaderElectionOptions
}

export interface LeaderElectionOptions {
    // ensure the leader election is enabled
    enabled?: boolean
    // lease name
    leaseName: string
    // renew interval
    renewInterval?: number
    // await leadership
    awaitLeadership?: boolean
    // use minikube for development
    useMinikubeForDevelopment?: boolean
}

