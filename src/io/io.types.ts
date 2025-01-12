import { INestApplication } from "@nestjs/common"
import { IoAdapter as NestIoAdapter } from "@nestjs/platform-socket.io"
import { IoAdapterType } from "@src/env"
export interface IoOptions {
    adapter?: IoAdapterType
}

export declare class IoAdapter extends NestIoAdapter {
    connect(): Promise<void>;
}

export interface IoAdapterFactory {
    createAdapter(app: INestApplication): IoAdapter
}