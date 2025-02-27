import { Module } from "@nestjs/common"
import { HoneycombModule as BaseHoneycombModule } from "@src/honeycomb"
import { BlockchainModule } from "@src/blockchain"
import { CreateProjectModule } from "./create-project"
import { HoneycombCommand } from "./honeycomb.command"
import { CreateResourceModule } from "./create-resource"
import { MintResourceModule } from "./mint-resource"

@Module({
    imports: [
        BlockchainModule.register({
            isGlobal: true
        }),
        BaseHoneycombModule.register({
            isGlobal: true,
            useGlobalImports: true,
        }), 
        CreateProjectModule,
        CreateResourceModule,
        MintResourceModule
    ],
    providers: [HoneycombCommand],
})
export class HoneycombModule {}