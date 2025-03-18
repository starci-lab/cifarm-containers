import { Module } from "@nestjs/common"
import { IdService } from "./id.service"
import { ConfigurableModuleClass } from "./id.module-definition"

@Module({
    providers: [IdService],
    exports: [IdService]
})
export class IdModule extends ConfigurableModuleClass {}
