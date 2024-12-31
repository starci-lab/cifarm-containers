import { Controller, Get, Logger } from "@nestjs/common"
import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator } from "@nestjs/terminus"
import { HEALTH_CHECK_ENDPOINT, HEALTH_CHECK_TIMEOUT, HealthCheckDependency } from "@src/health-check"

@Controller()
export class HealthCheckController {
    private readonly logger = new Logger(HealthCheckController.name)

    constructor(
        private health: HealthCheckService,
        private db: TypeOrmHealthIndicator,
    ) {}

    @Get(HEALTH_CHECK_ENDPOINT)
    @HealthCheck()
    healthz() {
        this.logger.log("Health check endpoint called")
        return this.health.check([
            async () => this.db.pingCheck(HealthCheckDependency.TelegramUserTrackerPostgreSQL, { timeout: HEALTH_CHECK_TIMEOUT }),
        ])
    }
}