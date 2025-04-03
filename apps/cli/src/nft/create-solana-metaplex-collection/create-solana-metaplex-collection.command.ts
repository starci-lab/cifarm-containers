import { CommandRunner, SubCommand, Option } from "nest-commander"
import { Logger } from "@nestjs/common"
import { Network } from "@src/env"
import { MetaplexCollectionMetadata, SolanaMetaplexService } from "@src/blockchain"
import { readFileSync } from "fs"

@SubCommand({ name: "create-solana-metaplex-collection", description: "Create the Solana metaplex collection" })
export class CreateSolanaMetaplexCollectionCommand extends CommandRunner {
    private readonly logger = new Logger(CreateSolanaMetaplexCollectionCommand.name)

    constructor(
        private readonly solanaMetaplexService: SolanaMetaplexService,
    ) {
        super()
    }

    async run(_: Array<string>, options: CreateSolanaMetaplexCollectionCommandOptions): Promise<void> {
        this.logger.debug("Creating new Solana metaplex collection...")
        const { name, network, metadataFilePath } = options
        try {
            const metadata = readFileSync(metadataFilePath, "utf-8")
            const parsedMetadata = JSON.parse(metadata) as MetaplexCollectionMetadata 
            const { collectionAddress, signature } = await this.solanaMetaplexService.createCollection({
                network,
                name,
                metadata: parsedMetadata
            })
            this.logger.debug(`Collection created: ${collectionAddress}`)
            this.logger.debug(`Transaction signature: ${signature}`)
        } catch (error) {
            this.logger.error(`Failed to create the resource: ${error.message}`)
        }
    }

    @Option({
        flags: "-n, --network <network>",
        description: "Network to create the project",
        defaultValue: Network.Testnet
    })
    parseNetwork(network: string): Network {
        return network as Network
    }

    @Option({
        flags: "--name <name>",
        description: "Name of the collection",
        defaultValue: "Dragon Fruit"
    })
    parseName(name: string): string {
        return name
    }

    @Option({
        flags: "-m, --metadata-file-path <metadata-file-path>",
        description: "Path to the metadata file",
        defaultValue: "./apps/cli/src/nft/create-solana-metaplex-collection/metadata.json"
    })
    parseMetadata(metadataFilePath: string): string {
        return metadataFilePath
    }
}

export interface CreateSolanaMetaplexCollectionCommandOptions {
    network: Network
    name: string
    metadataFilePath: string
}
