import { CommandRunner, SubCommand, Option } from "nest-commander"
import { Logger } from "@nestjs/common"
import { Network } from "@src/env"
import { SolanaService } from "@src/blockchain"

@SubCommand({
    name: "transfer-solana-metaplex-nft",
    description: "Transfer the Solana metaplex NFT"
})
export class TransferSolanaMetaplexNFTCommand extends CommandRunner {
    private readonly logger = new Logger(TransferSolanaMetaplexNFTCommand.name)

    constructor(private readonly SolanaService: SolanaService) {
        super()
    }

    async run(_: Array<string>, options: TransferSolanaMetaplexNFTCommandOptions): Promise<void> {
        this.logger.debug("Transferring Solana metaplex NFT...")
        const { network, nftAddress, toAddress, collectionAddress } = options
        try {
            const { signature } = await this.SolanaService.transferNft({
                network,
                nftAddress,
                toAddress,
                collectionAddress
            })
            this.logger.debug(`Transaction signature: ${signature}`)
        } catch (error) {
            this.logger.error(`Failed to transfer the resource: ${error.message}`)
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
        flags: "-na, --nft-address <nft-address>",
        description: "Address of the NFT",
        required: true
    })
    parseNftAddress(nftAddress: string): string {
        return nftAddress
    }

    @Option({
        flags: "-ta, --to-address <to-address>",
        description: "Address of the new owner",
        required: true
    })
    parseToAddress(toAddress: string): string {
        return toAddress
    }

    @Option({
        flags: "-ca, --collection-address <collection-address>",
        description: "Address of the collection",
        defaultValue: "FkJJyaMCMmNHGWQkBkrVBo9Trz8o9ZffKBcpyC3SdZx4"
    })
    parseCollectionAddress(collectionAddress: string): string {
        return collectionAddress
    }
}

export interface TransferSolanaMetaplexNFTCommandOptions {
    network: Network
    toAddress: string
    nftAddress: string
    collectionAddress: string
}
