import { Module } from "@nestjs/common"
import { CreateProjectModule } from "./create-project"
import { HoneycombCommand } from "./honeycomb.command"
import { CreateResourceModule } from "./create-resource"
import { MintResourceModule } from "./mint-resource"
import { CreateSplStakingPoolModule } from "./create-spl-staking-pool"
import { CreateProfilesTreeModule } from "./create-profiles-tree"
import { CreateAssemblerConfigModule } from "./create-assembler-config"
import { CreateCharacterModelModule } from "./create-character-model"
import { CreateCharacterTreeModule } from "./create-character-tree"
@Module({
    imports: [
        CreateProjectModule,
        CreateResourceModule,
        MintResourceModule,
        CreateSplStakingPoolModule,
        CreateProfilesTreeModule,
        CreateAssemblerConfigModule,
        CreateCharacterModelModule,
        CreateCharacterTreeModule
    ],
    providers: [HoneycombCommand],
})
export class HoneycombModule {}