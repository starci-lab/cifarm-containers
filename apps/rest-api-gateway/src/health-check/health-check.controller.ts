import { Controller, Get, Logger } from "@nestjs/common"
import { HealthCheckService, HealthCheck, HttpHealthIndicator } from "@nestjs/terminus"
import { getHttpUrl } from "@src/common"
import { envConfig } from "@src/env"
import { HEALTH_CHECK_ENDPOINT, HealthCheckDependency } from "@src/health-check"

@Controller()
export class HealthCheckController {
    private readonly logger = new Logger(HealthCheckController.name)

    constructor(
        private health: HealthCheckService,
        private http: HttpHealthIndicator,
    ) { }

    @Get(HEALTH_CHECK_ENDPOINT)
    @HealthCheck()
    healthz() {
        this.logger.log("Health check endpoint called")
        return this.health.check([
            async () =>
                await this.http.pingCheck(
                    HealthCheckDependency.GameplayService,
                    getHttpUrl(
                        {
                            host : envConfig().containers.gameplayService.host,
                            port: envConfig().containers.gameplayService.healthCheckPort,
                            path: HEALTH_CHECK_ENDPOINT
                        }
                    )),
        ])
    }
}