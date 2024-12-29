import { Inject, Injectable } from "@nestjs/common"
import { ClientGrpc } from "@nestjs/microservices"
import { grpcData } from "./grpc.constants"
import { GrpcServiceName } from "./grpc.types"

@Injectable()
export class GrpcService {
    constructor(
        @Inject(grpcData[GrpcServiceName.Gameplay].name) private grpcClient: ClientGrpc
    ) {}

    getClient(): ClientGrpc {
        return this.grpcClient
    }
}