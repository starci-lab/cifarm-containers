export enum Container {
    RestApiGateway = "restApiGateway",
    IoGameplay = "ioGameplay",
    GameplayService = "gameplayService",
    GraphQLGateway = "graphQlGateway",
    GameplaySubgraph = "gameplaySubgraph",
    CronWorker = "cronWorker",
    CronScheduler = "cronScheduler",
    TelegramBot = "telegramBot",
    Cli = "cli",
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

export enum ChainKey {
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
    [ChainKey.Near]: {
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

export enum RedisType {
    Cache = "cache",
    Job = "job",
    Adapter = "adapter"
}

export enum PostgreSQLDatabase {
    Gameplay = "gameplay",
    Telegram = "telegram"
}

export enum MongoDatabase {
    Adapter = "adapter",
    Gameplay = "gameplay"
}

export enum PostgreSQLContext {
    Main = "main",
    Mock = "mock"
}

export enum MongoDbContext {
    Main = "main",
    Mock = "mock"
}

export enum MongoDbDatabase {
    Gameplay = "gameplay",
    Telegram = "telegram"
}

export enum Brokers {
    Kafka = "kafka",
}

export enum IoAdapterType {
    Redis = "redis",
    MongoDb = "mongodb",
    Cluster = "cluster",
}