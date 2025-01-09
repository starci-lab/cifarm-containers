import { GrpcOptions as NestGrpcOptions } from "@nestjs/microservices"
export enum GrpcServiceName {
    Gameplay = "gameplay"
}
        
export interface GrpcServiceData {
    name: string
    service: string
    package: string
    protoPath: string
}

export interface GrpcOptions {
    name?: GrpcServiceName
}

export type GrpcConfig = NestGrpcOptions["options"];