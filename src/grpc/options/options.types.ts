import { BaseOptionsOptions } from "@src/common"
import { GrpcOptions } from "../grpc.types"

export interface GrpcOptionsOptions extends BaseOptionsOptions<GrpcOptions> {
    useLoopbackAddress?: boolean
}
