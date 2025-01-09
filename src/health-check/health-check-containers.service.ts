import { Injectable } from "@nestjs/common"
import { HealthIndicatorResult, HttpHealthIndicator } from "@nestjs/terminus"
import { getHttpUrl } from "@src/common"
import { Container, envConfig } from "@src/env"
import { HEALTH_CHECK_ENDPOINT, HEALTH_CHECK_TIMEOUT } from "./health-check.constants"
import { HealthCheckDependency } from "./health-check.types"

@Injectable()
export class HealthCheckContainersService {
    constructor(
        private readonly http: HttpHealthIndicator
    ) {
    }
    public async pingCheckGameplayService(): Promise<HealthIndicatorResult> {
        return await this.http.pingCheck(
            HealthCheckDependency.GameplayService,
            getHttpUrl({
                host: envConfig().containers[Container.GameplayService].host,
                port: envConfig().containers[Container.GameplayService].healthCheckPort,
                path: HEALTH_CHECK_ENDPOINT
            }), {
                timeout: HEALTH_CHECK_TIMEOUT
            }
        )
    }

    // Ping check for gameplay service
    public async pingCheckGameplaySubgraph(): Promise<HealthIndicatorResult> {
        return await this.http.pingCheck(
            HealthCheckDependency.GameplaySubgraph,
            getHttpUrl({
                host: envConfig().containers[Container.GameplaySubgraph].host,
                port: envConfig().containers[Container.GameplaySubgraph].healthCheckPort,
                path: HEALTH_CHECK_ENDPOINT
            }), {
                timeout: HEALTH_CHECK_TIMEOUT
            }
        )
    }

    // Ping check for websocket node
    public async pingCheckWebsocketNode(): Promise<HealthIndicatorResult> {
        return await this.http.pingCheck(
            HealthCheckDependency.WebsocketNode,
            getHttpUrl({
                host: envConfig().containers[Container.WebsocketNode].host,
                port: envConfig().containers[Container.WebsocketNode].healthCheckPort,
                path: HEALTH_CHECK_ENDPOINT
            }), {
                timeout: HEALTH_CHECK_TIMEOUT
            }
        )
    }

    // Ping check for graphql gateway
    public async pingCheckGraphQlGateway(): Promise<HealthIndicatorResult> {
        return await this.http.pingCheck(
            HealthCheckDependency.GraphQLGateway,
            getHttpUrl({
                host: envConfig().containers[Container.GraphQLGateway].host,
                port: envConfig().containers[Container.GraphQLGateway].healthCheckPort,
                path: HEALTH_CHECK_ENDPOINT
            }), {
                timeout: HEALTH_CHECK_TIMEOUT
            }
        )
    }

    // Ping check for rest api gateway
    public async pingCheckRestApiGateway(): Promise<HealthIndicatorResult> {
        return await this.http.pingCheck(
            HealthCheckDependency.RestApiGateway,
            getHttpUrl({
                host: envConfig().containers[Container.RestApiGateway].host,
                port: envConfig().containers[Container.RestApiGateway].healthCheckPort,
                path: HEALTH_CHECK_ENDPOINT
            }), {
                timeout: HEALTH_CHECK_TIMEOUT
            }
        )
    }

    // ping check for cron scheduler
    public async pingCheckCronScheduler(): Promise<HealthIndicatorResult> {
        return await this.http.pingCheck(
            HealthCheckDependency.CronScheduler,
            getHttpUrl({
                host: envConfig().containers[Container.CronScheduler].host,
                port: envConfig().containers[Container.CronScheduler].healthCheckPort,
                path: HEALTH_CHECK_ENDPOINT
            }), {
                timeout: HEALTH_CHECK_TIMEOUT
            }
        )
    }

    // ping check for cron worker
    public async pingCheckCronWorker(): Promise<HealthIndicatorResult> {
        return await this.http.pingCheck(
            HealthCheckDependency.CronWorker,
            getHttpUrl({
                host: envConfig().containers[Container.CronWorker].host,
                port: envConfig().containers[Container.CronWorker].healthCheckPort,
                path: HEALTH_CHECK_ENDPOINT
            }), {
                timeout: HEALTH_CHECK_TIMEOUT
            }
        )
    }
}
