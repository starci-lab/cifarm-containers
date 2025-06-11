import { CommandRunner, SubCommand, Option } from "nest-commander"
import { Logger } from "@nestjs/common"
import { Network } from "@src/env"
import { SolanaService } from "@src/blockchain"
import { NFTCollectionKey } from "@src/databases"

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
        const { network, nftCollectionKey } = options
        const { name, uri } = this.getMetadata(nftCollectionKey)
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
        defaultValue: NFTCollectionKey.DragonFruit
    })
    parseNFTCollectionKey(nftCollectionKey: string): NFTCollectionKey {
        return nftCollectionKey as NFTCollectionKey
    }

    getMetadata(nftCollectionKey: NFTCollectionKey): Metadata {
        const metadataMap: Record<NFTCollectionKey, Metadata> = {
            [NFTCollectionKey.DragonFruit]: {
                name: "Dragon Fruit",
                uri: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/collection-metadata/dragon-fruit-metadata.json"
            },
            [NFTCollectionKey.Jackfruit]: {
                name: "Jackfruit",
                uri: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/collection-metadata/jackfruit-metadata.json"
            },
            [NFTCollectionKey.Rambutan]: {
                name: "Rambutan",
                uri: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/collection-metadata/rambutan-metadata.json"
            },
            [NFTCollectionKey.Pomegranate]: {
                name: "Pomegranate",
                uri: "https://cifarm.sgp1.cdn.digitaloceanspaces.com/collection-metadata/pomegranate-metadata.json"
            }
        }
        return metadataMap[nftCollectionKey]
    }
}

export interface CreateSolanaMetaplexCollectionCommandOptions {
    network: Network
    nftCollectionKey: NFTCollectionKey
}

export interface Metadata {
    name: string
    uri: string
}