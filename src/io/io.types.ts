export interface IoOptions {
    adapter?: IoAdapterType
}

export enum IoAdapterType {
    Redis = "redis",
    MongoDb = "mongodb"
}
