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