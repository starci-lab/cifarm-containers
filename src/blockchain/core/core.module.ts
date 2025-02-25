import { Module } from "@nestjs/common"
import { ConfigurableModuleClass } from "./core.module-definition"
import { SolanaCoreService } from "./solana.service"

@Module({
    providers: [
        SolanaCoreService,
    ],
    exports: [
        SolanaCoreService
    ]
})
export class CoreModule extends ConfigurableModuleClass {}
