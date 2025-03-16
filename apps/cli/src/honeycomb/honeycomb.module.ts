import { Module } from "@nestjs/common"
import { HoneycombModule as BaseHoneycombModule } from "@src/honeycomb"
import { BlockchainModule } from "@src/blockchain"
import { CreateProjectModule } from "./create-project"
import { HoneycombCommand } from "./honeycomb.command"
import { CreateResourceModule } from "./create-resource"
import { MintResourceModule } from "./mint-resource"
import { CreateSplStakingPoolModule } from "./create-spl-staking-pool"
import { CreateProfilesTreeModule } from "./create-profiles-tree"
import { CreateAssemblerConfigModule } from "./create-assembler-config"
import { CreateCharacterModelModule } from "./create-character-model"

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
        MintResourceModule,
        CreateSplStakingPoolModule,
        CreateProfilesTreeModule,
        CreateAssemblerConfigModule,
        CreateCharacterModelModule
    ],
    providers: [HoneycombCommand],
})
export class HoneycombModule {}