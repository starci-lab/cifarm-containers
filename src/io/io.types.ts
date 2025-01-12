import { IoAdapter as NestIoAdapter } from "@nestjs/platform-socket.io"

export interface IoOptions {
    adapter?: IoAdapterType
}

export enum IoAdapterType {
    Redis = "redis",
    MongoDb = "mongodb"
}

export abstract class IoAdapter extends NestIoAdapter {
    abstract connect(): Promise<void>
}
