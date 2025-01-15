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
    ) {}

    // General method for pinging any container
    private async pingCheckContainer(
        dependency: HealthCheckDependency,
        container: Container
    ): Promise<HealthIndicatorResult> {
        return await this.http.pingCheck(
            dependency,
            getHttpUrl({
                host: envConfig().containers[container]?.host,
                port: envConfig().containers[container]?.healthCheckPort,
                path: HEALTH_CHECK_ENDPOINT
            }),
            {
                timeout: HEALTH_CHECK_TIMEOUT
            }
        )
    }

    // Ping checks for specific services
    public async pingCheckGameplayService(): Promise<HealthIndicatorResult> {
        return this.pingCheckContainer(HealthCheckDependency.GameplayService, Container.GameplayService)
    }

    public async pingCheckGameplaySubgraph(): Promise<HealthIndicatorResult> {
        return this.pingCheckContainer(HealthCheckDependency.GameplaySubgraph, Container.GameplaySubgraph)
    }

    public async pingCheckIoGameplay(): Promise<HealthIndicatorResult> {
        return this.pingCheckContainer(HealthCheckDependency.IoGameplay, Container.IoGameplay)
    }

    public async pingCheckGraphQlGateway(): Promise<HealthIndicatorResult> {
        return this.pingCheckContainer(HealthCheckDependency.GraphQLGateway, Container.GraphQLGateway)
    }

    public async pingCheckRestApiGateway(): Promise<HealthIndicatorResult> {
        return this.pingCheckContainer(HealthCheckDependency.RestApiGateway, Container.RestApiGateway)
    }

    public async pingCheckCronScheduler(): Promise<HealthIndicatorResult> {
        return this.pingCheckContainer(HealthCheckDependency.CronScheduler, Container.CronScheduler)
    }

    public async pingCheckCronWorker(): Promise<HealthIndicatorResult> {
        return this.pingCheckContainer(HealthCheckDependency.CronWorker, Container.CronWorker)
    }
}
