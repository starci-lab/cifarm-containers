import { GrpcOptions as NestGrpcOptions } from "@nestjs/microservices"

export interface GrpcOptions {
    name?: GrpcName
}

export enum GrpcName {
    Gameplay = "gameplay"
}
        
export interface GrpcData {
    name: string
    service: string
    package: string
    protoPath: string
}

export interface GrpcConnection {
    host: string
    port: number
}

export type GrpcNestConfig = NestGrpcOptions["options"];

export interface GrpcConfig {
    data: GrpcData
    connection: GrpcConnection
}