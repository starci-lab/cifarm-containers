import { Controller, Get, Logger } from "@nestjs/common"
import { RedisOptions, Transport } from "@nestjs/microservices"
import { HealthCheckService, HealthCheck, TypeOrmHealthIndicator, MicroserviceHealthIndicator } from "@nestjs/terminus"
import { envConfig, healthCheckConfig, timerConfig } from "@src/grpc"

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
            async () => this.db.pingCheck(healthCheckConfig.names.gameplayPostgreSql, { timeout: HEALTH_CHECK_TIMEOUT }),
            async () =>
                this.microservice.pingCheck<RedisOptions>(healthCheckConfig.names.cacheRedis, {
                    transport: Transport.REDIS,
                    options: {
                        host: envConfig().database.redis.cache.host,
                        port: envConfig().database.redis.cache.port
                    },
                    timeout: HEALTH_CHECK_TIMEOUT,
                }),
        ])
    }
}