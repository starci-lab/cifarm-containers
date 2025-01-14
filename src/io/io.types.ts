import { INestApplication } from "@nestjs/common"
import { IoAdapter as NestIoAdapter } from "@nestjs/platform-socket.io"
import { BaseOptions } from "@src/common"
import { IoAdapterType } from "@src/env"

export declare class IoAdapter extends NestIoAdapter {
    connect(): Promise<void> | void
}

export interface IoOptions extends BaseOptions {
    adapter?: IoAdapterType
}

export interface IoAdapterFactory {
    createAdapter(app: INestApplication): IoAdapter
}