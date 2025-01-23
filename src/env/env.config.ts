import {
    Container,
    NodeEnv,
    ChainKey,
    Network,
    RedisType,
    PostgreSQLDatabase,
    PostgreSQLContext,
    Brokers,
    MongoDatabase,
    IoAdapterType
} from "./env.types"
import {
    DEFAULT_CACHE_TIMEOUT_MS,
    DEFAULT_HEALTH_PORT,
    DEFAULT_KAFKA_PORT,
    DEFAULT_PORT,
    DEFAULT_POSTGRES_PORT,
    DEFAULT_REDIS_PORT,
    LOCALHOST
} from "./env.constants"
export const envConfig = () => ({
    nodeEnv: (process.env.NODE_ENV ?? NodeEnv.Development) as NodeEnv,
    cacheTimeoutMs: {
        manager: process.env.MANAGER_CACHE_TIMEOUT_MS
            ? Number.parseInt(process.env.MANAGER_CACHE_TIMEOUT_MS)
            : DEFAULT_CACHE_TIMEOUT_MS,
        postgreSql: process.env.POSTGRESQL_CACHE_TIMEOUT_MS
            ? Number.parseInt(process.env.POSTGRESQL_CACHE_TIMEOUT_MS)
            : DEFAULT_CACHE_TIMEOUT_MS,
        graphql: process.env.GRAPHQL_CACHE_TIMEOUT_MS
            ? Number.parseInt(process.env.GRAPHQL_CACHE_TIMEOUT_MS)
            : DEFAULT_CACHE_TIMEOUT_MS
    },
    cors: {
        origin:
            process.env.NODE_ENV !== NodeEnv.Production
                ? "*"
                : process.env.CORS_ORIGIN === "false"
                    ? false
                    : process.env.CORS_ORIGIN === "true"
                        ? true
                        : process.env.CORS_ORIGIN.split(",")
    },
    containers: {
        [Container.RestApiGateway]: {
            host: process.env.REST_API_GATEWAY_HOST ?? LOCALHOST,
            port: process.env.REST_API_GATEWAY_PORT
                ? Number.parseInt(process.env.REST_API_GATEWAY_PORT)
                : DEFAULT_PORT,
            healthCheckPort: process.env.REST_API_GATEWAY_HEALTH_CHECK_PORT
                ? Number.parseInt(process.env.REST_API_GATEWAY_HEALTH_CHECK_PORT)
                : DEFAULT_HEALTH_PORT
        },
        [Container.IoGameplay]: {
            host: process.env.IO_GAMEPLAY_HOST ?? LOCALHOST,
            port: process.env.IO_GAMEPLAY_PORT
                ? Number.parseInt(process.env.IO_GAMEPLAY_PORT)
                : DEFAULT_PORT,
            healthCheckPort: process.env.IO_GAMEPLAY_HEALTH_CHECK_PORT
                ? Number.parseInt(process.env.IO_GAMEPLAY_HEALTH_CHECK_PORT)
                : DEFAULT_HEALTH_PORT,
            adminUiPort: process.env.IO_GAMEPLAY_ADMIN_UI_PORT
                ? Number.parseInt(process.env.IO_GAMEPLAY_ADMIN_UI_PORT)
                : 8082,
            adapter: (process.env.IO_GAMEPLAY_ADAPTER ?? IoAdapterType.MongoDb) as IoAdapterType,
            cluster: {
                enabled: process.env.IO_GAMEPLAY_CLUSTER_ENABLED === "true",
                numberOfWorkers: process.env.IO_GAMEPLAY_CLUSTER_NUMBER_OF_WORKERS
                    ? Number.parseInt(process.env.IO_GAMEPLAY_CLUSTER_NUMBER_OF_WORKERS)
                    : 3,
                workerPort: process.env.IO_GAMEPLAY_CLUSTER_WORKER_PORT
                    ? Number.parseInt(process.env.IO_GAMEPLAY_CLUSTER_WORKER_PORT)
                    : DEFAULT_PORT + 10
            }
        },
        [Container.GameplayService]: {
            host: process.env.GAMEPLAY_SERVICE_HOST ?? LOCALHOST,
            port: process.env.GAMEPLAY_SERVICE_PORT
                ? Number.parseInt(process.env.GAMEPLAY_SERVICE_PORT)
                : DEFAULT_PORT,
            healthCheckPort: process.env.GAMEPLAY_SERVICE_HEALTH_CHECK_PORT
                ? Number.parseInt(process.env.GAMEPLAY_SERVICE_HEALTH_CHECK_PORT)
                : DEFAULT_HEALTH_PORT
        },
        [Container.GraphQLGateway]: {
            host: process.env.GRAPHQL_GATEWAY_HOST ?? LOCALHOST,
            port: process.env.GRAPHQL_GATEWAY_PORT
                ? Number.parseInt(process.env.GRAPHQL_GATEWAY_PORT)
                : DEFAULT_PORT,
            healthCheckPort: process.env.GRAPHQL_GATEWAY_HEALTH_CHECK_PORT
                ? Number.parseInt(process.env.GRAPHQL_GATEWAY_HEALTH_CHECK_PORT)
                : DEFAULT_HEALTH_PORT
        },
        [Container.GameplaySubgraph]: {
            host: process.env.GAMEPLAY_SUBGRAPH_HOST ?? LOCALHOST,
            port: process.env.GAMEPLAY_SUBGRAPH_PORT
                ? Number.parseInt(process.env.GAMEPLAY_SUBGRAPH_PORT)
                : DEFAULT_PORT,
            healthCheckPort: process.env.GAMEPLAY_SUBGRAPH_HEALTH_CHECK_PORT
                ? Number.parseInt(process.env.GAMEPLAY_SUBGRAPH_HEALTH_CHECK_PORT)
                : DEFAULT_HEALTH_PORT
        },
        [Container.CronWorker]: {
            host: process.env.CRON_WORKER_HOST ?? LOCALHOST,
            healthCheckPort: process.env.CRON_WORKER_HEALTH_CHECK_PORT
                ? Number.parseInt(process.env.CRON_WORKER_HEALTH_CHECK_PORT)
                : DEFAULT_HEALTH_PORT
        },
        [Container.CronScheduler]: {
            host: process.env.CRON_SCHEDULER_HOST ?? LOCALHOST,
            healthCheckPort: process.env.CRON_SCHEDULER_HEALTH_CHECK_PORT
                ? Number.parseInt(process.env.CRON_SCHEDULER_HEALTH_CHECK_PORT)
                : DEFAULT_HEALTH_PORT
        },
        [Container.TelegramBot]: {
            host: process.env.TELEGRAM_BOT_HOST ?? LOCALHOST,
            healthCheckPort: process.env.TELEGRAM_BOT_HEALTH_CHECK_PORT
                ? Number.parseInt(process.env.TELEGRAM_BOT_HEALTH_CHECK_PORT)
                : DEFAULT_HEALTH_PORT
        }
    },
    databases: {
        postgresql: {
            [PostgreSQLDatabase.Gameplay]: {
                [PostgreSQLContext.Main]: {
                    dbName: process.env.GAMEPLAY_POSTGRESQL_DBNAME ?? "gameplay",
                    host: process.env.GAMEPLAY_POSTGRESQL_HOST ?? LOCALHOST,
                    port:
                        Number.parseInt(process.env.GAMEPLAY_POSTGRESQL_PORT) ??
                        DEFAULT_POSTGRES_PORT,
                    username: process.env.GAMEPLAY_POSTGRESQL_USERNAME,
                    password: process.env.GAMEPLAY_POSTGRESQL_PASSWORD
                },
                [PostgreSQLContext.Mock]: {
                    dbName: process.env.GAMEPLAY_MOCK_POSTGRESQL_DBNAME ?? "gameplay",
                    host: process.env.GAMEPLAY_MOCK_POSTGRESQL_HOST ?? LOCALHOST,
                    port:
                        Number.parseInt(process.env.GAMEPLAY_MOCK_POSTGRESQL_PORT) ??
                        DEFAULT_POSTGRES_PORT,
                    username: process.env.GAMEPLAY_MOCK_POSTGRESQL_USERNAME,
                    password: process.env.GAMEPLAY_MOCK_POSTGRESQL_PASSWORD
                }
            },
            [PostgreSQLDatabase.Telegram]: {
                [PostgreSQLContext.Main]: {
                    dbName: process.env.TELEGRAM_POSTGRESQL_DBNAME ?? "telegram",
                    host: process.env.TELEGRAM_POSTGRESQL_HOST ?? LOCALHOST,
                    port:
                        Number.parseInt(process.env.TELEGRAM_POSTGRESQL_PORT) ??
                        DEFAULT_POSTGRES_PORT,
                    username: process.env.TELEGRAM_POSTGRESQL_USERNAME,
                    password: process.env.TELEGRAM_POSTGRESQL_PASSWORD
                },
                [PostgreSQLContext.Mock]: {
                    dbName: process.env.TELEGRAM_MOCK_POSTGRESQL_DBNAME ?? "telegram",
                    host: process.env.TELEGRAM_MOCK_POSTGRESQL_HOST ?? LOCALHOST,
                    port:
                        Number.parseInt(process.env.TELEGRAM_MOCK_POSTGRESQL_PORT) ??
                        DEFAULT_POSTGRES_PORT,
                    username: process.env.TELEGRAM_MOCK_POSTGRESQL_USERNAME,
                    password: process.env.TELEGRAM_MOCK_POSTGRESQL_PASSWORD
                }
            }
        },
        mongo: {
            [MongoDatabase.Adapter]: {
                host: process.env.ADAPTER_MONGODB_HOST ?? LOCALHOST,
                port: process.env.ADAPTER_MONGODB_PORT ? Number.parseInt(process.env.ADAPTER_MONGODB_PORT) : DEFAULT_PORT,
                username: process.env.ADAPTER_MONGODB_USERNAME,
                password: process.env.ADAPTER_MONGODB_PASSWORD,
                dbName: process.env.ADAPTER_MONGODB_DBNAME
            },
        },
        redis: {
            [RedisType.Cache]: {
                // in k8s, redis cluster are hiden behind service, so we do not need to specify many nodes
                host: process.env.CACHE_REDIS_HOST ?? LOCALHOST,
                port: Number.parseInt(process.env.CACHE_REDIS_PORT) ?? DEFAULT_REDIS_PORT,
                password: process.env.CACHE_REDIS_PASSWORD,
                cluster: {
                    enabled: process.env.CACHE_REDIS_CLUSTER_ENABLED === "true",
                    runInDocker: process.env.CACHE_REDIS_CLUSTER_RUN_IN_DOCKER === "true",
                    dockerNetworkName: process.env.CACHE_REDIS_CLUSTER_DOCKER_NETWORK_NAME
                }
            },
            [RedisType.Adapter]: {
                host: process.env.ADAPTER_REDIS_HOST,
                port: Number.parseInt(process.env.ADAPTER_REDIS_PORT) ?? DEFAULT_REDIS_PORT,
                password: process.env.ADAPTER_REDIS_PASSWORD,
                cluster: {
                    enabled: process.env.ADAPTER_REDIS_CLUSTER_ENABLED === "true",
                    runInDocker: process.env.ADAPTER_REDIS_CLUSTER_RUN_IN_DOCKER === "true",
                    dockerNetworkName: process.env.ADAPTER_REDIS_CLUSTER_DOCKER_NETWORK_NAME
                }
            },
            [RedisType.Job]: {
                host: process.env.JOB_REDIS_HOST,
                port: Number.parseInt(process.env.JOB_REDIS_PORT) ?? DEFAULT_REDIS_PORT,
                password: process.env.JOB_REDIS_PASSWORD,
                cluster: {
                    enabled: process.env.JOB_REDIS_CLUSTER_ENABLED === "true",
                    runInDocker: process.env.JOB_REDIS_CLUSTER_RUN_IN_DOCKER === "true",
                    dockerNetworkName: process.env.JOB_REDIS_CLUSTER_DOCKER_NETWORK_NAME
                }
            }
        }
    },
    brokers: {
        [Brokers.Kafka]: {
            host: process.env.KAFKA_HOST ?? LOCALHOST,
            port: process.env.KAFKA_PORT ?? DEFAULT_KAFKA_PORT,
            sasl: {
                enabled: process.env.KAFKA_SASL_ENABLED === "true",
                username: process.env.KAFKA_SASL_USERNAME,
                password: process.env.KAFKA_SASL_PASSWORD
            }
        }
    },
    secrets: {
        salt: process.env.SALT,
        telegram: {
            botToken: process.env.TELEGRAM_BOT_TOKEN,
            mock: {
                authData: process.env.TELEGRAM_MOCK_AUTH_DATA,
                userId: Number(process.env.TELEGRAM_MOCK_USER_ID),
                username: process.env.TELEGRAM_MOCK_USERNAME
            }
        },
        jwt: {
            secret: process.env.JWT_SECRET,
            accessTokenExpiration: process.env.JWT_ACCESS_TOKEN_EXPIRATION ?? "15m",
            refreshTokenExpiration: process.env.JWT_REFRESH_TOKEN_EXPIRATION ?? "30d"
        },
        admin: {
            username: process.env.ADMIN_USERNAME,
            password: process.env.ADMIN_PASSWORD
        }
    },
    chainCredentials: {
        [ChainKey.Near]: {
            tokenMinter: {
                [Network.Testnet]: {
                    privateKey: process.env.NEAR_TOKEN_MINTER_PRIVATE_KEY_TESTNET,
                    accountId: process.env.NEAR_TOKEN_MINTER_ACCOUNT_ID_TESTNET
                },
                [Network.Mainnet]: {
                    privateKey: process.env.NEAR_TOKEN_MINTER_PRIVATE_KEY_MAINNET,
                    accountId: process.env.NEAR_TOKEN_MINTER_ACCOUNT_ID_MAINNET
                }
            },
            tokenBurner: {
                [Network.Testnet]: {
                    privateKey: process.env.NEAR_TOKEN_BURNER_PRIVATE_KEY_TESTNET,
                    accountId: process.env.NEAR_TOKEN_BURNER_ACCOUNT_ID_TESTNET
                },
                [Network.Mainnet]: {
                    privateKey: process.env.NEAR_TOKEN_BURNER_PRIVATE_KEY_MAINNET,
                    accountId: process.env.NEAR_TOKEN_BURNER_ACCOUNT_ID_MAINNET
                }
            },
            nftMinter: {
                [Network.Testnet]: {
                    privateKey: process.env.NEAR_NFT_MINTER_PRIVATE_KEY_TESTNET,
                    accountId: process.env.NEAR_NFT_MINTER_ACCOUNT_ID_TESTNET
                },
                [Network.Mainnet]: {
                    privateKey: process.env.NEAR_NFT_MINTER_PRIVATE_KEY_MAINNET,
                    accountId: process.env.NEAR_NFT_MINTER_ACCOUNT_ID_MAINNET
                }
            },
            nftBurner: {
                [Network.Testnet]: {
                    privateKey: process.env.NEAR_NFT_BURNER_PRIVATE_KEY_TESTNET,
                    accountId: process.env.NEAR_NFT_BURNER_ACCOUNT_ID_TESTNET
                },
                [Network.Mainnet]: {
                    privateKey: process.env.NEAR_NFT_BURNER_PRIVATE_KEY_MAINNET,
                    accountId: process.env.NEAR_NFT_BURNER_ACCOUNT_ID_MAINNET
                }
            },
            nftUpdater: {
                [Network.Testnet]: {
                    privateKey: process.env.NEAR_NFT_UPDATER_PRIVATE_KEY_TESTNET,
                    accountId: process.env.NEAR_NFT_UPDATER_ACCOUNT_ID_TESTNET
                },
                [Network.Mainnet]: {
                    privateKey: process.env.NEAR_NFT_UPDATER_PRIVATE_KEY_MAINNET,
                    accountId: process.env.NEAR_NFT_UPDATER_ACCOUNT_ID_MAINNET
                }
            },
            admin: {
                [Network.Testnet]: {
                    privateKey: process.env.NEAR_ADMIN_PRIVATE_KEY_TESTNET,
                    accountId: process.env.NEAR_ADMIN_ACCOUNT_ID_TESTNET
                },
                [Network.Mainnet]: {
                    privateKey: process.env.NEAR_ADMIN_PRIVATE_KEY_MAINNET,
                    accountId: process.env.NEAR_ADMIN_ACCOUNT_ID_MAINNET
                }
            },
            creator: {
                [Network.Testnet]: {
                    privateKey: process.env.NEAR_CREATOR_PRIVATE_KEY_TESTNET,
                    accountId: process.env.NEAR_CREATOR_ACCOUNT_ID_TESTNET
                },
                [Network.Mainnet]: {
                    privateKey: process.env.NEAR_CREATOR_PRIVATE_KEY_MAINNET,
                    accountId: process.env.NEAR_CREATOR_ACCOUNT_ID_MAINNET
                }
            }
        }
    },
    kubernetes: {
        namespace: process.env.POD_NAMESPACE ?? "containers",
        serviceHost: process.env.KUBERNETES_SERVICE_HOST,
        hostname: process.env.KUBERNETES_HOSTNAME
    },
    socketIoAdmin: {
        username: process.env.SOCKET_IO_ADMIN_USERNAME,
        password: process.env.SOCKET_IO_ADMIN_PASSWORD
    },
    productionUrl: process.env.PRODUCTION_URL,
    // e2e debugging
    e2eEnabled: process.env.E2E_ENABLED === "true",
})
