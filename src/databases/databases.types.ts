
export enum PostgreSQLDatabase {
    Gameplay = "gameplay",
    Telegram = "telegram"
}

export enum DatabaseContext {
    Main = "main",
    Mock = "mock"
}

export interface TypeORMConfig {
    host: string
    port: number
    username: string
    password: string
    database: string
}