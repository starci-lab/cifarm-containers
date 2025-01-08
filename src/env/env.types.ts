export const enum Container {
    RestApiGateway = "restApiGateway",
    WebsocketNode = "websocketNode",
    GameplayService = "gameplayService",
    GraphqlGateway = "graphqlGateway",
    GameplaySubgraph = "gameplaySubgraph",
    CronWorker = "cronWorker",
    CronScheduler = "cronScheduler",
    TelegramBot = "telegramBot",
}

export enum NodeEnv {
    Production = "production",
    Development = "development"
}

export interface NearPair {
    privateKey: string
    accountId: string
}

export enum Network {
    Testnet = "testnet",
    Mainnet = "mainnet"
}

export enum SupportedChainKey {
    Sui = "sui",
    Aptos = "aptos",
    Avalanche = "avalanche",
    Solana = "solana",
    Bsc = "bsc",
    Algorand = "algorand",
    Polkadot = "polkadot",
    Near = "near"
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

export const enum RedisType {
    Cache = "cache",
    Job = "job",
    Adapter = "adapter"
}

export enum PostgreSQLDatabase {
    Gameplay = "gameplay",
    Telegram = "telegram"
}

export enum PostgreSQLContext {
    Main = "main",
    Mock = "mock"
}

export enum Brokers {
    Kafka = "kafka",
}