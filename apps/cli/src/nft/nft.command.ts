import { Command, CommandRunner } from "nest-commander"
import { Logger } from "@nestjs/common"
import { CreateSolanaMetaplexCollectionCommand } from "./create-solana-metaplex-collection"
import { MintSolanaMetaplexNFTCommand } from "./mint-solana-metaplex-nft"

@Command({
    name: "nft",
    description: "manage nft actions",
    subCommands: [ CreateSolanaMetaplexCollectionCommand, MintSolanaMetaplexNFTCommand ],
})
export class NFTCommand extends CommandRunner {
    private readonly logger = new Logger(NFTCommand.name)
    constructor(
    ) {
        super()
    }

    async run(): Promise<void> {
        this.logger.error("Please specify a subcommand, e.g. create-solana-metaplex-collection")
    }
}