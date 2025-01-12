import { PostgreSQLOptions, UserEntity } from "@src/databases"
import { Network, PostgreSQLContext, PostgreSQLDatabase, SupportedChainKey } from "@src/env"
import { DeepPartial } from "typeorm"

export const MOCK_DATABASE_OPTIONS: PostgreSQLOptions = {
    context: PostgreSQLContext.Main,
    database: PostgreSQLDatabase.Gameplay
}

export const MOCK_USER: DeepPartial<UserEntity> = {
    username: "test_user",
    chainKey: SupportedChainKey.Solana,
    accountAddress: "0x123456789abcdef",
    network: Network.Mainnet,
    tokens: 50.5,
    experiences: 10,
    energy: 5,
    level: 2,
    golds: 10000
}