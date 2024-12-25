import { SupportedChainKey, Network } from "./blockchain.config"

export enum NodeEnv {
    Production = "production",
    Development = "development"
}

export interface NearPair {
    privateKey: string
    accountId: string
}

export interface ChainCredentialsConfig {
    [SupportedChainKey.Near]: {
        tokenMinter: Record<Network, NearPair>
        tokenBurner: Record<Network, NearPair>
        nftMinter: Record<Network, NearPair>
        nftBurner: Record<Network, NearPair>
        nftUpdater: Record<Network, NearPair>
        admin: Record<Network, NearPair>
        // creator is account used for create near account
        creator: Record<Network, NearPair>
    }
}

export const envConfig = () => ({
    port: process.env.PORT ?? 9999,
    nodeEnv: (process.env.NODE_ENV ?? NodeEnv.Development) as NodeEnv,
    cors: {
        origin:
            process.env.NODE_ENV !== "production"
                ? "*"
                : process.env.CORS_ORIGIN === "false"
                    ? false 
                    : process.env.CORS_ORIGIN === "true"
                        ? true
                        : process.env.CORS_ORIGIN.split(",")
    },
    
    graphqlFederation: {
        subgraphUrls: {
            static: process.env.GRAPHQL_SUBGRAPH_STATIC_URL,
            port: process.env.GRAPHQL_STATIC_SUBGRAPH_PORT
        }
    },
    containers: {
        restApiGateway: {
            host: process.env.REST_API_GATEWAY_HOST,
            port: Number(process.env.REST_API_GATEWAY_PORT)
        },
        graphqlApiGateway: {
            host: process.env.GRAPHQL_API_GATEWAY_HOST,
            port: Number(process.env.GRAPHQL_API_GATEWAY_PORT)
        },
        websocketApiGateway: {
            host: process.env.WEBSOCKET_API_GATEWAY_HOST,
            port: Number(process.env.WEBSOCKET_API_GATEWAY_PORT)
        },
        gameplayService: {
            host: process.env.GAMEPLAY_SERVICE_HOST,
            port: Number(process.env.GAMEPLAY_SERVICE_PORT),
            healthcheckPort: process.env.GAMEPLAY_SERVICE_HEALTHCHECK_PORT
        }
    },
    database: {
        mongo: {
            mongo1: {
                dbName: process.env.MONGO_1_DB_NAME,
                host: process.env.MONGO_1_HOST,
                port: process.env.MONGO_1_PORT,
                user: process.env.MONGO_1_USER,
                pass: process.env.MONGO_1_PASS
            }
        },
        postgresql: {
            gameplay: {
                main: {
                    dbName: process.env.GAMEPLAY_POSTGRESQL_DBNAME,
                    host: process.env.GAMEPLAY_POSTGRESQL_HOST,
                    port: Number(process.env.GAMEPLAY_POSTGRESQL_PORT),
                    user: process.env.GAMEPLAY_POSTGRESQL_USER,
                    pass: process.env.GAMEPLAY_POSTGRESQL_PASS
                },
                test: {
                    dbName: process.env.GAMEPLAY_TEST_POSTGRESQL_DBNAME,
                    host: process.env.GAMEPLAY_TEST_POSTGRESQL_HOST,
                    port: Number(process.env.GAMEPLAY_TEST_POSTGRESQL_PORT),
                    user: process.env.GAMEPLAY_TEST_POSTGRESQL_USER,
                    pass: process.env.GAMEPLAY_TEST_POSTGRESQL_PASS
                }
            }
        },
        redis: {
            cache: {
                host: process.env.CACHE_REDIS_HOST,
                port: Number(process.env.CACHE_REDIS_PORT)
            },
            adapter: {
                host: process.env.ADAPTER_REDIS_HOST,
                port: Number(process.env.ADAPTER_REDIS_PORT)
            },
            job: {
                host: process.env.JOB_REDIS_HOST,
                port: Number(process.env.JOB_REDIS_PORT)
            }
        }
    },
    messageBrokers: {
        rabbitMq: {
            rabbitMq1: {
                user: process.env.RABBITMQ_1_USER,
                password: process.env.RABBITMQ_1_PASSWORD,
                port: process.env.RABBITMQ_1_PORT,
                host: process.env.RABBITMQ_1_HOST
            }
        },
        kafka: {
            kafka1: {
                host: process.env.KAFKA_1_HOST,
                port: process.env.KAFKA_1_PORT
            }
        }
    },
    zookeeper: {
        host: process.env.ZOOKEEPER_HOST,
        port: process.env.ZOOKEEPER_PORT
    },
    nakama: {
        host: process.env.NAKAMA_HOST,
        port: process.env.NAKAMA_PORT,
        ssl: process.env.NAKAMA_SSL === "true",
        key: process.env.NAKAMA_KEY,
        authenticationId: process.env.NAKAMA_AUTHENTICATION_ID
    },
    redis: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT ?? 6379),
        ttl: Number(process.env.REDIS_TTL)
    },
    secrets: {
        salt: process.env.SALT,
        telegram: {
            botTokens: {
                ciwallet: process.env.TELEGRAM_CIWALLET_BOT_TOKEN,
                cifarm: process.env.TELEGRAM_CIFARM_BOT_TOKEN
            },
            mockAuthorization: process.env.TELEGRAM_MOCK_AUTHORIZATION
        },
        jwt: {
            secret: process.env.JWT_SECRET,
            accessTokenExpiration: process.env.JWT_ACCESS_TOKEN_EXPIRATION,
            refreshTokenExpiration: process.env.JWT_REFRESH_TOKEN_EXPIRATION
        },
        admin: {
            username: process.env.ADMIN_USERNAME,
            password: process.env.ADMIN_PASSWORD
        }
    },
    kafka: {
        headless: {
            headless1: {
                host: process.env.HEADLESS_KAFKA_1_HOST,
                port: process.env.HEADLESS_KAFKA_1_PORT
            },
            headless2: {
                host: process.env.HEADLESS_KAFKA_2_HOST,
                port: process.env.HEADLESS_KAFKA_2_PORT
            },
            headless3: {
                host: process.env.HEADLESS_KAFKA_3_HOST,
                port: process.env.HEADLESS_KAFKA_3_PORT
            }
        },
        default: {
            default1: {
                host: process.env.KAFKA_1_HOST,
                port: process.env.KAFKA_1_PORT
            }
        }
    },
    chainCredentials: {
        [SupportedChainKey.Near]: {
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
        defined: {
            namespace: process.env.POD_NAMESPACE,
        },
        generated: {
            serviceHost: process.env.KUBERNETES_SERVICE_HOST,
            hostname: process.env.KUBERNETES_HOSTNAME,
        }
    },
})


export interface NearPair {
    privateKey: string
    accountId: string
}
