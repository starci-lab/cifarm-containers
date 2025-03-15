import { CommandRunner, SubCommand, Option } from "nest-commander"
import { Logger } from "@nestjs/common"
import { Network } from "@src/env"
import { HoneycombService } from "@src/honeycomb"

@SubCommand({ name: "mint-resource", description: "Mint the honeycomb resource" })
export class MintResourceCommand extends CommandRunner {
    private readonly logger = new Logger(MintResourceCommand.name)

    constructor(
        private readonly honeycombService: HoneycombService
    ) {
        super()
    }

    async run(_: Array<string>, options?: CreateResourceCommandOptions): Promise<void> {
        console.log(options)
        this.logger.debug("Creating the resource...")
        try {
            const { txResponse } = await this.honeycombService.createMintResourceTransaction({
                network: options.network,
                amount: options.amount,
                resourceAddress: options.resourceAddress,
                toAddress: options.toAddress,
            })
            const { signature } = await this.honeycombService.sendTransaction({
                network: options.network,
                txResponse
            })
            this.logger.debug(`Resource created with txHash: ${signature}`)
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
        flags: "-a, --amount <amount>",
        description: "Amount to mint",
        defaultValue: 10000000 // 10 $CARROT
    })
    parseAmount(amount: string): number {
        return parseInt(amount)
    }

    @Option({
        flags: "-ra, --resource-address <resourceAddress>",
        description: "Resource address",
    })
    parseResourceAddress(resourceAddress: string): string {
        return resourceAddress
    }

    @Option({
        flags: "-ta, --to-address <toAddress>",
        description: "To address",
    })
    parseToAddress(toAddress: string): string {
        return toAddress
    } 
}

export interface CreateResourceCommandOptions {
    //create the database if it does not exist
    network: Network
    amount: number
    resourceAddress: string
    toAddress: string
}
