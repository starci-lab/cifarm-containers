import { Controller, Get, Logger } from "@nestjs/common"
import { HealthCheckService, HealthCheck, HttpHealthIndicator } from "@nestjs/terminus"
import { envConfig, healthCheckConfig } from "@src/config"
import { getHttpAddress } from "@src/utils"

@Controller()
export class HealthCheckController {
    private readonly logger = new Logger(HealthCheckController.name)

    constructor(
        private health: HealthCheckService,
        private http: HttpHealthIndicator,
    ) { }

    @Get(healthCheckConfig.endpoint)
    @HealthCheck()
    healthz() {
        this.logger.log("Health check endpoint called")
        return this.health.check([
            async () =>
                await this.http.pingCheck(
                    healthCheckConfig.names.gameplayService,
                    getHttpAddress(
                        envConfig().containers.gameplayService.host,
                        envConfig().containers.gameplayService.healthcheckPort,
                        healthCheckConfig.endpoint
                    )),
        ])
    }
}