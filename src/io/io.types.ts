import { INestApplication } from "@nestjs/common"
import { IoAdapter as NestIoAdapter } from "@nestjs/platform-socket.io"
export interface IoOptions {
    adapter?: IoAdapterType
}

export enum IoAdapterType {
    Redis = "redis",
    MongoDb = "mongodb",
    Cluster = "cluster",
}

export declare class IoAdapter extends NestIoAdapter {
    connect(): Promise<void>;
}

export interface IoAdapterFactory {
    createAdapter(app: INestApplication): IoAdapter
}