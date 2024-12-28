export interface GameplayPostgreSQLOptions {
    type?: GameplayPostgreSQLType
}

export enum GameplayPostgreSQLType {
    Main = "main",
    Test = "test"
}