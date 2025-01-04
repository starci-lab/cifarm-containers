export interface GameplayPostgreSQLOptions {
    type?: GameplayPostgreSQLType,
    cache?: boolean
}

export enum GameplayPostgreSQLType {
    Main = "main",
    Test = "test"
}

