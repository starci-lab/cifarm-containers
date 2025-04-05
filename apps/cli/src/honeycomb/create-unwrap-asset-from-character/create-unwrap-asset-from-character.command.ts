import { CommandRunner, SubCommand, Option } from "nest-commander"
import { Logger } from "@nestjs/common"
import { Network } from "@src/env"
import { HoneycombService } from "@src/honeycomb"

@SubCommand({ name: "create-unwrap-asset-from-character", description: "Create the honeycomb unwrap asset from character" })
export class CreateUnwrapAssetFromCharacterCommand extends CommandRunner {
    private readonly logger = new Logger(CreateUnwrapAssetFromCharacterCommand.name)

    constructor(private readonly honeycombService: HoneycombService) {
        super()
    }

    async run(_: Array<string>, options?: CreateUnwrapAssetFromCharacterCommandOptions): Promise<void> {
        const { network, projectAddress, walletAddress, characterAddress, characterModelAddress } = options
        this.logger.debug("Creating the unwrap asset from character...")
        try {
            const { txResponses } =
            await this.honeycombService.createUnwrapAssetsFromCharacterTransactions({
                network,
                projectAddress,
                walletAddress,
                characterAddresses: [characterAddress],
                characterModelAddress,
            })  
            const transactions = await this.honeycombService.sendTransactions({
                network,
                txResponses
            })
            for (const transaction of transactions) {
                this.logger.debug(`Transaction: ${transaction.responses.map(response => response.signature)}`)
                this.logger.debug(`Bundle ID: ${transaction.bundleId}`)
            }
        } catch (ex) {
            this.logger.error(ex)
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
        flags: "-p, --projectAddress <projectAddress>",
        description: "Project address",
        defaultValue: "BoRbyNqh3YmYzzuFMLZ2kjFEC1whr4zS9wPskqp7uqZL"
    })
    parseProjectAddress(projectAddress: string): string {
        return projectAddress
    }

    @Option({
        flags: "-wa, --walletAddress <walletAddress>",
        description: "Wallet address",
        defaultValue: "QVeEob5S8U47rwSH6wMsPRiFDPCcQ3wPqBgfjQQd8aX"
    })
    parseWalletAddress(walletAddress: string): string {
        return walletAddress
    }

    @Option({
        flags: "-ca, --characterAddress <characterAddress>",
        description: "Character address",
        defaultValue: "4PzSh87tPLL544We3ePLH6VaKUdHuscWEn21Eej5QpUq"
    })
    parseCharacterAddress(characterAddress: string): string {
        return characterAddress
    }

    @Option({
        flags: "-cm, --characterModelAddress <characterModelAddress>",
        description: "Character model address",
        defaultValue: "AuHyybLoYrHFHy3D6rPkoc9Dn7VPPD2sYcTm4wJgVvCe"
    })
    parseCharacterModelAddress(characterModelAddress: string): string {
        return characterModelAddress
    }
}

export interface CreateUnwrapAssetFromCharacterCommandOptions {
    //create the database if it does not exist
    network: Network
    projectAddress: string
    walletAddress: string
    characterAddress: string
    characterModelAddress: string
}

//sample
//npm run cli:dev hc create-unwrap-asset-from-character
