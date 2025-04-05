import { Command, CommandRunner } from "nest-commander"
import { Logger } from "@nestjs/common"
import { CreateProjectCommand } from "./create-project"
import { CreateResourceCommand } from "./create-resource"
import { MintResourceCommand } from "./mint-resource"
import { CreateSplStakingPoolCommand } from "./create-spl-staking-pool"
import { CreateProfilesTreeCommand } from "./create-profiles-tree"
import { CreateAssemblerConfigCommand } from "./create-assembler-config"
import { CreateCharacterModelCommand } from "./create-character-model"
import { CreateCharacterTreeCommand } from "./create-character-tree"
import { CreateWrapAssetToCharacterCommand } from "./create-wrap-asset-to-character"
import { CreateUnwrapAssetFromCharacterCommand } from "./create-unwrap-asset-from-character"

@Command({
    name: "honeycomb",
    aliases: ["hc"],
    description: "manage honeycomb actions",
    subCommands: [
        CreateProjectCommand,
        CreateResourceCommand,
        MintResourceCommand,
        CreateSplStakingPoolCommand,
        CreateProfilesTreeCommand,
        CreateAssemblerConfigCommand,
        CreateCharacterModelCommand,
        CreateCharacterTreeCommand,
        CreateWrapAssetToCharacterCommand,
        CreateUnwrapAssetFromCharacterCommand   
    ]
})
export class HoneycombCommand extends CommandRunner {
    private readonly logger = new Logger(HoneycombCommand.name)
    constructor() {
        super()
    }

    async run(): Promise<void> {
        this.logger.error("Please specify a subcommand, e.g. seed")
    }
}
