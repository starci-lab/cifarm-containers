import { INestApplication } from "@nestjs/common"
import { IoAdapter } from "@nestjs/platform-socket.io"
export interface IoOptions {
    adapter?: IoAdapter
}

export interface IoAdapterFactory {
    createAdapter(app: INestApplication): IoAdapter
}