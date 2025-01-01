export enum GrpcServiceName {
    Gameplay = "gameplay"
}
        
export interface GrpcServiceData {
    name: string
    service: string
    package: string
    protoPath: string
}

export interface GrpcRegisterOptions {
    name: GrpcServiceName
}