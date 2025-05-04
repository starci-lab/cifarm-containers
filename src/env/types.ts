import { registerEnumType } from "@nestjs/graphql"
import { createEnumType } from "@src/common"

export enum Container {
    Ws = "ws",
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

export const GraphQLTypeNetwork = createEnumType(Network)

registerEnumType(GraphQLTypeNetwork, {
    name: "Network",
    description: "The current chain key",
    valuesMap: {
        [Network.Testnet]: {
            description: "Testnet network key"
        },
        [Network.Mainnet]: {
            description: "Mainnet network key"
        },
    }
})


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

export const GraphQLTypeChainKey = createEnumType(ChainKey)
registerEnumType(GraphQLTypeChainKey, {
    name: "ChainKey",
    description: "The current chain key",
    valuesMap: {
        [ChainKey.Sui]: {
            description: "The Sui chain key"
        },
        [ChainKey.Aptos]: {
            description: "The Aptos chain key"
        },
        [ChainKey.Avalanche]: {
            description: "The Avalanche chain key"
        },
        [ChainKey.Solana]: {
            description: "The Solana chain key"
        },
        [ChainKey.Bsc]: {
            description: "The BSC chain key"
        },
        [ChainKey.Algorand]: {
            description: "The Algorand chain key"
        },
        [ChainKey.Polkadot]: {
            description: "The Polkadot chain key"
        },
        [ChainKey.Near]: {
            description: "The Near chain key"
        }
    }
})

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

export enum MongoDatabase {
    Adapter = "adapter",
    Gameplay = "gameplay"
}

export enum MongoDbContext {
    Main = "main",
    Mock = "mock"
}


export enum Brokers {
    Kafka = "kafka",
}

export enum IoAdapterType {
    Redis = "redis",
    MongoDb = "mongodb",
    Cluster = "cluster",
    RedisStream = "redis-stream"
}

export enum S3Provider {
    DigitalOcean1 = "digitalocean1",
}