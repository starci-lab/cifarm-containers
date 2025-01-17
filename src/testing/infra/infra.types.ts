export enum TestContext {
    Gameplay = "gameplay",
    Telegram = "telegram",
    Blockchain = "blockchain",
    E2E = "e2e"
}

export interface TestingInfraOptions {
    context?: TestContext
}