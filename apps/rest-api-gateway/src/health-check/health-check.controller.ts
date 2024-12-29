import { Controller, Get, Logger } from "@nestjs/common"
import { HealthCheckService, HealthCheck, HttpHealthIndicator } from "@nestjs/terminus"
import { envConfig, healthCheckConfig } from "@src/grpc"
import { getHttpUrl } from "@src/common/utils"

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
                    healthCheckConfig.names.gameplayService,
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