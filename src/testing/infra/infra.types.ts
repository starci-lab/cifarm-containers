export enum TestContext {
    Gameplay = "gameplay",
    Telegram = "telegram",
    Blockchain = "blockchain",
    E2E = "e2e"
}

export enum ApiVersion {
    V1 = "v1",
    V2 = "v2"
}

export interface GameplayTestingInfraOptions {
    context: TestContext.Gameplay
}

export interface E2ETestingInfraOptions {
    context: TestContext.E2E
    options?: {
        axios?: {
            version?: ApiVersion
        }
    }
}
export type TestingInfraOptions = GameplayTestingInfraOptions | E2ETestingInfraOptions