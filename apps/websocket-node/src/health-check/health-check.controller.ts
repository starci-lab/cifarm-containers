import { Controller, Get, Logger } from "@nestjs/common"
import { KafkaOptions, RedisOptions, Transport } from "@nestjs/microservices"
import { HealthCheck, HealthCheckService, MicroserviceHealthIndicator, TypeOrmHealthIndicator } from "@nestjs/terminus"
import { ChildProcessDockerRedisClusterService } from "@src/exec"
import { envConfig, redisClusterRunInDocker, RedisType } from "@src/env"
import { HEALTH_CHECK_ENDPOINT, HEALTH_CHECK_TIMEOUT, HealthCheckDependency } from "@src/health-check"
import { NatMap } from "ioredis"
import { v4 } from "uuid"

@Controller()
export class HealthCheckController {
    private readonly logger = new Logger(HealthCheckController.name)

    constructor(
        private health: HealthCheckService,
        private microservice: MicroserviceHealthIndicator,
        private db: TypeOrmHealthIndicator,
        private childProcessDockerRedisClusterService: ChildProcessDockerRedisClusterService
    ) {}

    @Get(HEALTH_CHECK_ENDPOINT)
    @HealthCheck()
    healthz() {
        return this.health.check([
            async () => this.db.pingCheck(HealthCheckDependency.GameplayPostgreSQL, { timeout: HEALTH_CHECK_TIMEOUT }),
            async () => {
                let natMap: NatMap
                if (redisClusterRunInDocker(RedisType.Adapter)) {
                    natMap = await this.childProcessDockerRedisClusterService.getNatMap()
                }
                return await this.microservice.pingCheck<RedisOptions>(HealthCheckDependency.CacheRedis, {
                    transport: Transport.REDIS,
                    options: {
                        host: envConfig().databases.redis[RedisType.Adapter].host,
                        port: envConfig().databases.redis[RedisType.Adapter].port,
                        password: envConfig().databases.redis[RedisType.Adapter].password,
                        preferredSlaves: true,
                        natMap,
                    },
                    timeout: HEALTH_CHECK_TIMEOUT,
                })
            },
            async () =>
                this.microservice.pingCheck<KafkaOptions>(HealthCheckDependency.Kafka, {
                    transport: Transport.KAFKA,
                    options: {
                        client: {
                            clientId: v4(),
                            brokers: [
                                `${envConfig().messageBrokers.kafka.host}:${envConfig().messageBrokers.kafka.port}`
                            ],
                            sasl: {
                                mechanism: "scram-sha-256",
                                username: envConfig().messageBrokers.kafka.username,
                                password: envConfig().messageBrokers.kafka.password
                            }
                        }
                    },
                    timeout: HEALTH_CHECK_TIMEOUT,
                }),
        ])
    }
}