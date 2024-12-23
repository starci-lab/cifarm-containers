/* eslint-disable @typescript-eslint/no-unused-vars */
export interface LeaderElectionOptions {
    leaseName?: string;
    renewalInterval?: number;
    logAtLevel?: "log" | "debug"
    awaitLeadership?: boolean;
}

export const LEADER_ELECTION_OPTIONS = "LEADER_ELECTION_OPTIONS"
export const LEADERSHIP_ELECTED_EVENT = "LEADERSHIP_ELECTED_EVENT"
export const LEADERSHIP_LOST_EVENT = "LEADERSHIP_LOST_EVENT"

const v1LeaseTypeFn = async () => {
    const { V1Lease } = await import("@kubernetes/client-node")
    return V1Lease
}

export type V1Lease = InstanceType<Awaited<ReturnType<typeof v1LeaseTypeFn>>>;

const kubeClientTypeFn = async () => {
    const { KubeConfig } = await import("@kubernetes/client-node")
    return KubeConfig
}
export type KubeClient = InstanceType<Awaited<ReturnType<typeof kubeClientTypeFn>>>;

const watchTypeFn = async () => {
    const { Watch } = await import("@kubernetes/client-node")
    return Watch
}
export type Watch = InstanceType<Awaited<ReturnType<typeof watchTypeFn>>>;

const coordinationV1ApiTypeFn = async () => {
    const { CoordinationV1Api } = await import("@kubernetes/client-node")
    return CoordinationV1Api
}
export type CoordinationV1Api = InstanceType<Awaited<ReturnType<typeof coordinationV1ApiTypeFn>>>;
