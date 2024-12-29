import { Controller, Get, Logger } from "@nestjs/common"
import { KafkaOptions, RedisOptions, Transport } from "@nestjs/microservices"
import { HealthCheckService, HealthCheck, TypeOrmHealthIndicator, MicroserviceHealthIndicator } from "@nestjs/terminus"
import { envConfig, healthCheckConfig, timerConfig } from "@src/config"
import { kafkaBrokers } from "@src/dynamic-modules"

@Controller()
export class HealthCheckController {
    private readonly logger = new Logger(HealthCheckController.name)

    constructor(
        private health: HealthCheckService,
        private microservice: MicroserviceHealthIndicator,
        private db: TypeOrmHealthIndicator,
    ) {}

    @Get(healthCheckConfig.endpoint)
    @HealthCheck()
    healthz() {
        return this.health.check([
            async () => this.db.pingCheck(healthCheckConfig.names.gameplayPostgreSql, { timeout: timerConfig.timeouts.healthcheck }),
            async () =>
                this.microservice.pingCheck<RedisOptions>(healthCheckConfig.names.cacheRedis, {
                    transport: Transport.REDIS,
                    options: {
                        host: envConfig().database.redis.cache.host,
                        port: envConfig().database.redis.cache.port
                    },
                    timeout: timerConfig.timeouts.healthcheck,
                }),
            async () =>
                this.microservice.pingCheck<KafkaOptions>(healthCheckConfig.names.kafka, {
                    transport: Transport.KAFKA,
                    options: {
                        client: {
                            brokers: kafkaBrokers(false),
                        },
                    },
                    timeout: timerConfig.timeouts.healthcheck,
                }),
        ])
    }
}