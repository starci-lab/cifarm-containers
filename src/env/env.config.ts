import {
    Container,
    NodeEnv,
    ChainKey,
    Network,
    RedisType,
    Brokers,
    MongoDatabase,
    IoAdapterType,
    S3Provider
} from "./types"
import {
    DEFAULT_CACHE_TIMEOUT_MS,
    DEFAULT_HEALTH_PORT,
    DEFAULT_KAFKA_PORT,
    DEFAULT_PORT,
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
    // we use upto 10 origins for each cors policy
    cors: {
        graphql: Array.from({ length: 10 }, (_, i) => {
            const origin = process.env[`GRAPHQL_ALLOW_ORIGIN_${i + 1}`]
            return origin ? [origin] : []
        }).flat(),
        ws: Array.from({ length: 10 }, (_, i) => {
            const origin = process.env[`WS_ALLOW_ORIGIN_${i + 1}`]
            return origin ? [origin] : []
        }).flat()
    },
    containers: {
        [Container.Ws]: {
            host: process.env.WS_HOST ?? LOCALHOST,
            port: process.env.WS_PORT
                ? Number.parseInt(process.env.WS_PORT)
                : DEFAULT_PORT,
            healthCheckPort: process.env.WS_HEALTH_CHECK_PORT
                ? Number.parseInt(process.env.WS_HEALTH_CHECK_PORT)
                : DEFAULT_HEALTH_PORT,
            adminUiPort: process.env.WS_ADMIN_UI_PORT
                ? Number.parseInt(process.env.WS_ADMIN_UI_PORT)
                : 8082,
            adapter: (process.env.WS_ADAPTER ?? IoAdapterType.MongoDb) as IoAdapterType,
            cluster: {
                enabled: process.env.WS_CLUSTER_ENABLED === "true",
                numberOfWorkers: process.env.WS_CLUSTER_NUMBER_OF_WORKERS
                    ? Number.parseInt(process.env.WS_CLUSTER_NUMBER_OF_WORKERS)
                    : 3,
                workerPort: process.env.WS_CLUSTER_WORKER_PORT
                    ? Number.parseInt(process.env.WS_CLUSTER_WORKER_PORT)
                    : DEFAULT_PORT + 10
            }
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
        },
        [Container.SocialAuth]: {
            host: process.env.SOCIAL_AUTH_HOST ?? LOCALHOST,
            port: process.env.SOCIAL_AUTH_PORT
                ? Number.parseInt(process.env.SOCIAL_AUTH_PORT)
                : DEFAULT_PORT,
            healthCheckPort: process.env.SOCIAL_AUTH_HEALTH_CHECK_PORT
                ? Number.parseInt(process.env.SOCIAL_AUTH_HEALTH_CHECK_PORT)
                : DEFAULT_HEALTH_PORT
        }
    },
    databases: {
        mongo: {
            [MongoDatabase.Adapter]: {
                host: process.env.ADAPTER_MONGODB_HOST ?? LOCALHOST,
                port: process.env.ADAPTER_MONGODB_PORT ? Number.parseInt(process.env.ADAPTER_MONGODB_PORT) : DEFAULT_PORT,
                username: process.env.ADAPTER_MONGODB_USERNAME,
                password: process.env.ADAPTER_MONGODB_PASSWORD,
                dbName: process.env.ADAPTER_MONGODB_DBNAME
            },
            [MongoDatabase.Gameplay]: {
                host: process.env.GAMEPLAY_MONGODB_HOST ?? LOCALHOST,
                port: process.env.GAMEPLAY_MONGODB_PORT ? Number.parseInt(process.env.GAMEPLAY_MONGODB_PORT) : DEFAULT_PORT,
                username: process.env.GAMEPLAY_MONGODB_USERNAME,
                password: process.env.GAMEPLAY_MONGODB_PASSWORD,
                dbName: process.env.GAMEPLAY_MONGODB_DBNAME
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
    telegram: {
        main: {
            botToken: process.env.TELEGRAM_BOT_TOKEN,
            miniappUrl: process.env.TELEGRAM_MINIAPP_URL
        } 
    },
    farcaster: {
        address: process.env.FARCASTER_ADDRESS,
        apiKey: process.env.FARCASTER_API_KEY,
        signerUuid: process.env.FARCASTER_SIGNER_UUID
    },
    s3: {
        [S3Provider.DigitalOcean1]: {
            bucketName: process.env.S3_DIGITALOCEAN1_BUCKET_NAME,
            endpoint: process.env.S3_DIGITALOCEAN1_ENDPOINT,
            region: process.env.S3_DIGITALOCEAN1_REGION,
            accessKeyId: process.env.S3_DIGITALOCEAN1_ACCESS_KEY_ID,
            secretAccessKey: process.env.S3_DIGITALOCEAN1_SECRET_ACCESS_KEY,
        }
    },
    crypto: {
        cipher: {
            secret: process.env.CIPHER_SECRET,
        },
        bcrypt: {
            salt: process.env.BCRYPT_SALT,
        },
    },
    session: {
        secret: process.env.SESSION_SECRET,
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        accessTokenExpiration: process.env.JWT_ACCESS_TOKEN_EXPIRATION ?? "15m",
        refreshTokenExpiration: process.env.JWT_REFRESH_TOKEN_EXPIRATION ?? "30d"
    },
    pinata: {
        apiKey: process.env.PINATA_API_KEY,
        secretApiKey: process.env.PINATA_SECRET_API_KEY,
        jwtToken: process.env.PINATA_JWT_TOKEN,
        gatewayUrl: process.env.PINATA_GATEWAY_URL,
    },
    firebase: {
        credential: {
            // we use _ in env variables to avoid special characters
            type: process.env.FIREBASE_CREDENTIAL_TYPE,
            projectId: process.env.FIREBASE_CREDENTIAL_PROJECT_ID,
            privateKeyId: process.env.FIREBASE_CREDENTIAL_PRIVATE_KEY_ID,
            privateKey: process.env.FIREBASE_CREDENTIAL_PRIVATE_KEY,
            clientEmail: process.env.FIREBASE_CREDENTIAL_CLIENT_EMAIL,
            clientId: process.env.FIREBASE_CREDENTIAL_CLIENT_ID,
            authUri: process.env.FIREBASE_CREDENTIAL_AUTH_URI,
            tokenUri: process.env.FIREBASE_CREDENTIAL_TOKEN_URI,
            authProviderX509CertUrl: process.env.FIREBASE_CREDENTIAL_AUTH_PROVIDER_X509_CERT_URL,
            clientX509CertUrl: process.env.FIREBASE_CREDENTIAL_CLIENT_X509_CERT_URL,
            universeDomain: process.env.FIREBASE_CREDENTIAL_UNIVERSE_DOMAIN,
        },
    },
    googleCloud: {
        oauth: {
            clientId: process.env.GOOGLE_CLOUD_OAUTH_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLOUD_OAUTH_CLIENT_SECRET,
            redirectUri: process.env.GOOGLE_CLOUD_OAUTH_REDIRECT_URI,
        },
        driver: {
            clientEmail: process.env.GOOGLE_CLOUD_DRIVER_CLIENT_EMAIL,
            privateKey: process.env.GOOGLE_CLOUD_DRIVER_PRIVATE_KEY,
            folderId: process.env.GOOGLE_CLOUD_DRIVER_FOLDER_ID,
        }
    },
    backup: {
        dir: process.env.BACKUP_DIR,
    },
    restore: {
        dir: process.env.RESTORE_DIR,
    },
    facebook: {
        oauth: {
            clientId: process.env.FACEBOOK_OAUTH_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_OAUTH_CLIENT_SECRET,
            redirectUri: process.env.FACEBOOK_OAUTH_REDIRECT_URI,
        }
    },
    xApi: {
        oauth: {
            clientId: process.env.X_OAUTH_CLIENT_ID,
            clientSecret: process.env.X_OAUTH_CLIENT_SECRET,
            redirectUri: process.env.X_OAUTH_REDIRECT_URI,
        }
    },
    chainCredentials: {
        [ChainKey.Solana]: {
            honeycombAuthority: {
                [Network.Mainnet]: {
                    privateKey: process.env.SOLANA_HONEYCOMB_AUTHORITY_PRIVATE_KEY_MAINNET
                },
                [Network.Testnet]: {
                    privateKey: process.env.SOLANA_HONEYCOMB_AUTHORITY_PRIVATE_KEY_TESTNET
                }
            },
            metaplexAuthority: {
                [Network.Mainnet]: {
                    privateKey: process.env.SOLANA_METAPLEX_AUTHORITY_PRIVATE_KEY_MAINNET
                },
                [Network.Testnet]: {
                    privateKey: process.env.SOLANA_METAPLEX_AUTHORITY_PRIVATE_KEY_TESTNET
                }
            },
            vault: {
                [Network.Mainnet]: {
                    privateKey: process.env.SOLANA_VAULT_PRIVATE_KEY_MAINNET
                },
                [Network.Testnet]: {
                    privateKey: process.env.SOLANA_VAULT_PRIVATE_KEY_TESTNET
                }
            }
        },
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
        hostname: process.env.KUBERNETES_HOSTNAME,
        useMinikubeForDevelopment: process.env.KUBERNETES_USE_MINIKUBE_FOR_DEVELOPMENT === "true",
    },
    socketIoAdmin: {
        username: process.env.SOCKET_IO_ADMIN_USERNAME,
        password: process.env.SOCKET_IO_ADMIN_PASSWORD
    },
    productionUrl: process.env.PRODUCTION_URL,
    // e2e debugging
    e2eEnabled: process.env.E2E_ENABLED === "true",
    webApps: {
        [Network.Mainnet]: {
            url: process.env.WEB_APP_URL_MAINNET
        },
        [Network.Testnet]: {
            url: process.env.WEB_APP_URL_TESTNET
        }
    },
    cron: {
        timeout: Number.parseInt(process.env.CRON_TIMEOUT ?? "15000")
    },
    elasticsearch: {
        url: process.env.ELASTICSEARCH_URL ?? "http://localhost:9200",
        username: process.env.ELASTICSEARCH_USERNAME,
        password: process.env.ELASTICSEARCH_PASSWORD,
        requireTLS: process.env.ELASTICSEARCH_REQUIRE_TLS === "true"
    },
    blockchainRpc: {
        refreshInterval: Number.parseInt(process.env.BLOCKCHAIN_RPC_REFRESH_INTERVAL ?? "180"), // 3 minutes
        dataCacheTime: Number.parseInt(process.env.BLOCKCHAIN_RPC_DATA_CACHE_TIME ?? "86400") // 1 day
    }
})
