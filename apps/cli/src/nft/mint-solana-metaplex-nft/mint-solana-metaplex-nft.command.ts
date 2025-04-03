import { CommandRunner, SubCommand, Option } from "nest-commander"
import { Logger } from "@nestjs/common"
import { Network } from "@src/env"
import { MetaplexNFTMetadata, SolanaMetaplexService } from "@src/blockchain"
import { readFileSync } from "fs"

@SubCommand({ name: "mint-solana-metaplex-nft", description: "Mint the Solana metaplex NFT" })
export class MintSolanaMetaplexNFTCommand extends CommandRunner {
    private readonly logger = new Logger(MintSolanaMetaplexNFTCommand.name)

    constructor(
        private readonly solanaMetaplexService: SolanaMetaplexService,
    ) {
        super()
    }

    async run(_: Array<string>, options: MintSolanaMetaplexNFTCommandOptions): Promise<void> {
        this.logger.debug("Creating new Solana metaplex collection...")
        const { name, network, metadataFilePath, collectionAddress, ownerAddress } = options
        try {
            const metadata = readFileSync(metadataFilePath, "utf-8")
            const parsedMetadata = JSON.parse(metadata) as MetaplexNFTMetadata 
            const { nftAddress, signature } = await this.solanaMetaplexService.mintNft({
                network,
                name,
                ownerAddress,
                collectionAddress,
                metadata: parsedMetadata
            })
            this.logger.debug(`NFT created: ${nftAddress}`)
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
        flags: "-n, --name <name>",
        description: "Name of the collection",
        defaultValue: "Dragon Fruit"
    })
    parseName(name: string): string {
        return name
    }

    @Option({
        flags: "-m, --metadata-file-path <metadata-file-path>",
        description: "Path to the metadata file",
        defaultValue: "./apps/cli/src/nft/mint-solana-metaplex-nft/metadata.json"
    })
    parseMetadata(metadataFilePath: string): string {
        return metadataFilePath
    }

    @Option({
        flags: "-ca, --collection-address <collection-address>",
        description: "Address of the collection",
        defaultValue: "FkJJyaMCMmNHGWQkBkrVBo9Trz8o9ZffKBcpyC3SdZx4"
    })
    parseCollectionAddress(collectionAddress: string): string {
        return collectionAddress
    }

    @Option({
        flags: "-oa, --owner-address <owner-address>",
        description: "Address of the owner",
        required: false,
    })
    parseOwnerAddress(ownerAddress: string): string {
        return ownerAddress
    }

}

export interface MintSolanaMetaplexNFTCommandOptions {
    network: Network
    name: string
    collectionAddress: string
    metadataFilePath: string
    ownerAddress: string
}
