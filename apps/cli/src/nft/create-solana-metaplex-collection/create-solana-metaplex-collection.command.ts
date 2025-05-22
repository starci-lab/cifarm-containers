import { CommandRunner, SubCommand, Option } from "nest-commander"
import { Logger } from "@nestjs/common"
import { Network } from "@src/env"
import { SolanaService } from "@src/blockchain"

@SubCommand({
    name: "create-solana-metaplex-collection",
    description: "Create the Solana metaplex collection"
})
export class CreateSolanaMetaplexCollectionCommand extends CommandRunner {
    private readonly logger = new Logger(CreateSolanaMetaplexCollectionCommand.name)

    constructor(private readonly SolanaService: SolanaService) {
        super()
    }

    async run(
        _: Array<string>,
        options: CreateSolanaMetaplexCollectionCommandOptions
    ): Promise<void> {
        this.logger.debug("Creating new Solana metaplex collection...")
        const { name, network, uri } = options
        try {
            const { collectionAddress, signature } =
                await this.SolanaService.createCollection({
                    network,
                    name,
                    metadata: {
                        name,
                        image: uri
                    }
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
        flags: "-u, --uri <uri>",
        description: "URI of the metadata file",
        defaultValue: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/dragon-fruit-collection-data.json"
    })
    parseURI(uri: string): string {
        return uri
    }
}

export interface CreateSolanaMetaplexCollectionCommandOptions {
    network: Network
    name: string
    uri: string
}
