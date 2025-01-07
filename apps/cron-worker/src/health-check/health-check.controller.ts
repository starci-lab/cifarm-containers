import { Controller, Get, Logger } from "@nestjs/common"
import { RedisOptions, Transport } from "@nestjs/microservices"
import { HealthCheckService, HealthCheck, TypeOrmHealthIndicator, MicroserviceHealthIndicator } from "@nestjs/terminus"
import { envConfig } from "@src/env"
import { HEALTH_CHECK_ENDPOINT, HEALTH_CHECK_TIMEOUT, HealthCheckDependency } from "@src/health-check"

@Controller()
export class HealthCheckController {
    private readonly logger = new Logger(HealthCheckController.name)

    constructor(
        private health: HealthCheckService,
        private microservice: MicroserviceHealthIndicator,
        private db: TypeOrmHealthIndicator,
    ) {}

    @Get(HEALTH_CHECK_ENDPOINT)
    @HealthCheck()
    healthz() {
        this.logger.log("Health check endpoint called")
        return this.health.check([
            async () => this.db.pingCheck(HealthCheckDependency.GameplayPostgreSQL, { timeout: HEALTH_CHECK_TIMEOUT }),
            async () =>
                this.microservice.pingCheck<RedisOptions>(HealthCheckDependency.CacheRedis, {
                    transport: Transport.REDIS,
                    options: {
                        host: envConfig().databases.redis.cache.host,
                        port: envConfig().databases.redis.cache.port
                    },
                    timeout: HEALTH_CHECK_TIMEOUT,
                }),
            async () =>
                this.microservice.pingCheck<RedisOptions>(HealthCheckDependency.JobRedis, {
                    transport: Transport.REDIS,
                    options: {
                        host: envConfig().databases.redis.job.host,
                        port: envConfig().databases.redis.job.port
                    },
                    timeout: HEALTH_CHECK_TIMEOUT,
                }),
        ])
    }
}