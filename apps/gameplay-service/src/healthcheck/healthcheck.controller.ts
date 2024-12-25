import { Controller, Get, Logger } from "@nestjs/common"
import { KafkaOptions, RedisOptions, Transport } from "@nestjs/microservices"
import { HealthCheckService, HealthCheck, TypeOrmHealthIndicator, MicroserviceHealthIndicator } from "@nestjs/terminus"
import { envConfig, timerConfig } from "@src/config"
import { kafkaBrokers } from "@src/dynamic-modules"

@Controller()
export class HealthcheckController {
    private readonly logger = new Logger(HealthcheckController.name)

    constructor(
        private health: HealthCheckService,
        private microservice: MicroserviceHealthIndicator,
        private db: TypeOrmHealthIndicator,
    ) {}

    @Get("/healthcheck")
    @HealthCheck()
    healthcheck() {
        this.logger.log("Health check endpoint called")
        return this.health.check([
            async () => this.db.pingCheck("gameplay-postgres", { timeout: timerConfig.timeouts.healthcheck }),
            async () =>
                this.microservice.pingCheck<RedisOptions>("cache-redis", {
                    transport: Transport.REDIS,
                    options: {
                        host: envConfig().database.redis.cache.host,
                        port: envConfig().database.redis.cache.port
                    },
                    timeout: timerConfig.timeouts.healthcheck,
                }),
            async () =>
                this.microservice.pingCheck<KafkaOptions>("kafka", {
                    transport: Transport.KAFKA,
                    options: {
                        client: {
                            brokers: kafkaBrokers(),
                        },
                    },
                    timeout: timerConfig.timeouts.healthcheck,
                }),
        ])
    }
}