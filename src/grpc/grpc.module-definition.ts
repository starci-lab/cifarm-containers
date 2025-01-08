import { ConfigurableModuleBuilder } from "@nestjs/common"
import { GrpcRegisterOptions } from "./grpc.types"

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } =
    new ConfigurableModuleBuilder<GrpcRegisterOptions>().setClassMethodName("forRoot").build()
