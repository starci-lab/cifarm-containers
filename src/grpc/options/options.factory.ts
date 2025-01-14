import { Inject, Injectable } from "@nestjs/common"
import { MODULE_OPTIONS_TOKEN } from "./options.module-definition"
import { GrpcOptionsOptions } from "./options.types"
import { GrpcName, GrpcNestConfig } from "../grpc.types"
import { getGrpcData } from "../grpc.constants"

@Injectable()
export class GrpcOptionsFactory {
    private readonly grpcName: GrpcName
    private readonly url: string
    private readonly package: string
    private readonly protoPath: string

    constructor(
        @Inject(MODULE_OPTIONS_TOKEN)
        private readonly options: GrpcOptionsOptions
    ) {
        this.grpcName = options.options.name ?? GrpcName.Gameplay
        const { data, url } = getGrpcData(this.grpcName)
        this.url = url
        this.package = data.package
        this.protoPath = data.protoPath
    }

    public createGrpcConfig(): GrpcNestConfig {
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
