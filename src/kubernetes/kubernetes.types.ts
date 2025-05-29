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
    renewalInterval?: number
    // await leadership
    awaitLeadership?: boolean
    // log at level
    logAtLevel?: "log" | "debug"
    // namespace
    namespace?: string
    // maximum number of retries for operations
    maxRetries?: number
    // base delay for exponential backoff (ms)
    baseDelay?: number
    // maximum delay for exponential backoff (ms)
    maxDelay?: number
    // timeout for watch health check (ms)
    watchHealthTimeout?: number
    // maximum number of circuit breaker failures before opening
    maxCircuitBreakerFailures?: number
    // circuit breaker timeout before attempting reset (ms)
    circuitBreakerTimeout?: number
}

