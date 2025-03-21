import { Module } from "@nestjs/common"
import { ConfigurableModuleClass } from "./object.module-definition"
import { ObjectService } from "./object.service"

@Module({
    providers: [ObjectService],
    exports: [ObjectService]
})
export class ObjectModule extends ConfigurableModuleClass {}
