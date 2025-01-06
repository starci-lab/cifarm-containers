/* eslint-disable @typescript-eslint/no-unused-vars */
export interface LeaderElectionOptions {
    leaseName?: string;
    renewalInterval?: number;
    logAtLevel?: "log" | "debug"
    awaitLeadership?: boolean;
}