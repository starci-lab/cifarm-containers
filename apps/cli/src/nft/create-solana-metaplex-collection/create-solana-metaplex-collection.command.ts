import { CommandRunner, SubCommand, Option } from "nest-commander"
import { Logger } from "@nestjs/common"
import { Network } from "@src/env"
import { SolanaService } from "@src/blockchain"
import { NFTType } from "@src/databases"

@SubCommand({
    name: "create-solana-metaplex-collection",
    description: "Create the Solana metaplex collection"
})
export class CreateSolanaMetaplexCollectionCommand extends CommandRunner {
    private readonly logger = new Logger(CreateSolanaMetaplexCollectionCommand.name)

    constructor(private readonly solanaService: SolanaService) {
        super()
    }

    async run(
        _: Array<string>,
        options: CreateSolanaMetaplexCollectionCommandOptions
    ): Promise<void> {
        this.logger.debug("Creating new Solana metaplex collection...")
        const { network, nftType } = options
        const { name, uri } = this.getMetadata(nftType)
        try {
            const { collectionAddress, signature } =
                await this.solanaService.createCollection({
                    network,
                    name,
                    uri
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
        flags: "-nt, --nft-type <nft-type>",
        description: "Type of the NFT",
        defaultValue: NFTType.DragonFruit
    })
    parseNFTType(nftType: string): NFTType {
        return nftType as NFTType
    }

    getMetadata(nftType: NFTType): Metadata {
        const metadataMap: Record<NFTType, Metadata> = {
            [NFTType.DragonFruit]: {
                name: "Dragon Fruit",
                uri: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/collection-metadata/dragon-fruit-metadata.json"
            },
            [NFTType.Jackfruit]: {
                name: "Jackfruit",
                uri: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/collection-metadata/jackfruit-metadata.json"
            },
            [NFTType.Rambutan]: {
                name: "Rambutan",
                uri: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/collection-metadata/rambutan-metadata.json"
            },
            [NFTType.Pomegranate]: {
                name: "Pomegranate",
                uri: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/collection-metadata/pomegranate-metadata.json"
            }
        }
        return metadataMap[nftType]
    }
}

export interface CreateSolanaMetaplexCollectionCommandOptions {
    network: Network
    nftType: NFTType
}

export interface Metadata {
    name: string
    uri: string
}