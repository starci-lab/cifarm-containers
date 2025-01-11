import { Inject, Injectable } from "@nestjs/common"
import { MODULE_OPTIONS_TOKEN } from "./options.module-definition"
import { GrpcOptionsOptions } from "./options.types"
import { GrpcConfig, GrpcServiceName } from "../grpc.types"
import { grpcData } from "../grpc.constants"
import { grpcUrlMap } from "../grpc.utils"

@Injectable()
export class GrpcOptionsFactory {
    private readonly grpcServiceName: GrpcServiceName
    private readonly url: string
    private readonly package: string
    private readonly protoPath: string

    constructor(
        @Inject(MODULE_OPTIONS_TOKEN)
        private readonly options: GrpcOptionsOptions
    ) {
        this.grpcServiceName = options.options.name ?? GrpcServiceName.Gameplay
        this.url = grpcUrlMap(options.useLoopbackAddress)[this.grpcServiceName]
        this.package = grpcData[this.grpcServiceName].package
        this.protoPath = grpcData[this.grpcServiceName].protoPath
    }

    public createGrpcConfig(): GrpcConfig {
        return {
            url: this.url,
            package: this.package,
            protoPath: this.protoPath
        }
    }
}

export interface CreateGrpcConfigParams {
    useLoopbackAddress?: boolean
}