import { Controller, Get, Logger } from "@nestjs/common"
import { HealthCheckService, HealthCheck, HttpHealthIndicator } from "@nestjs/terminus"
import { envConfig, healthcheckConfig } from "@src/config"
import { getHttpAddress } from "@src/utils"

@Controller()
export class HealthcheckController {
    private readonly logger = new Logger(HealthcheckController.name)

    constructor(
        private health: HealthCheckService,
        private http: HttpHealthIndicator,
    ) { }

    @Get(healthcheckConfig.endpoint)
    @HealthCheck()
    healthz() {
        this.logger.log("Health check endpoint called")
        return this.health.check([
            async () =>
                await this.http.pingCheck(
                    healthcheckConfig.names.gameplayService,
                    getHttpAddress(
                        envConfig().containers.gameplayService.host,
                        envConfig().containers.gameplayService.healthcheckPort,
                        healthcheckConfig.endpoint
                    )),
        ])
    }
}