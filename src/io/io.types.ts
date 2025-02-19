import { INestApplication } from "@nestjs/common"
import { IoAdapter as NestIoAdapter } from "@nestjs/platform-socket.io"
import { BaseOptions } from "@src/common"
import { IoAdapterType } from "@src/env"
import { UserLike } from "@src/jwt"
import { RemoteSocket, DefaultEventsMap, Socket } from "socket.io"
import { DecorateAcknowledgementsWithMultipleResponses } from "socket.io/dist/typed-events"

export declare class IoAdapter extends NestIoAdapter {
    connect(): Promise<void> | void
}

export interface IoOptions extends BaseOptions {
    adapter?: IoAdapterType
}

export interface IoAdapterFactory {
    createAdapter(app: INestApplication): IoAdapter
}

export interface AbstractSocketData {
    user: UserLike
}

export type TypedSocket<TSocketData extends AbstractSocketData> = Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, TSocketData>
export type TypedRemoteSocket<TSocketData extends AbstractSocketData> = RemoteSocket<DecorateAcknowledgementsWithMultipleResponses<DefaultEventsMap>, TSocketData>
export type SocketLike<TSocketData extends AbstractSocketData> =
    | TypedSocket<TSocketData>
    | TypedRemoteSocket<TSocketData>
