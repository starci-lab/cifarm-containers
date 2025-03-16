import { CommandRunner, SubCommand, Option } from "nest-commander"
import { Logger } from "@nestjs/common"
import { Network } from "@src/env"
import { HoneycombService } from "@src/honeycomb"

@SubCommand({ name: "create-assembler-config", description: "Create the honeycomb assembler config" })
export class CreateAssemblerConfigCommand extends CommandRunner {
    private readonly logger = new Logger(CreateAssemblerConfigCommand.name)

    constructor(
        private readonly honeycombService: HoneycombService
    ) {
        super()
    }

    async run(_: Array<string>, options?: CreateAssemblerConfigCommandOptions): Promise<void> {
        const { network, projectAddress, numAssets, ticker } = options
        this.logger.debug("Creating the assembler config...")
        const { txResponse, assemblerConfigAddress } = await this.honeycombService.createCreateAssemblerConfigTransaction({
            network,
            projectAddress,
            ticker,
            treeConfig: {
                basic: {
                    numAssets
                }
            },
        })
        const { signature, status, error } = await this.honeycombService.sendTransaction({
            network,
            txResponse
        })
        if (status.trim().toLowerCase() === "success") {
            this.logger.debug(`Assembler config created with txHash: ${signature}`)
            this.logger.debug(`Assembler config address: ${assemblerConfigAddress}`)
        } else {
            this.logger.error(error)
            this.logger.error(`Failed to create the assembler config: ${error}`)
        }
    }

    @Option({
        flags: "-t, --ticker <ticker>",
        description: "Ticker",
        defaultValue: "Fruit"
    })
    parseTicker(ticker: string): string {
        return ticker
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
        flags: "-n, --numAssets <numAssets>",
        description: "Number of assets",
        defaultValue: 100000
    })
    parseNumAssets(numAssets: string): number {
        return parseInt(numAssets)
    }
}

export interface CreateAssemblerConfigCommandOptions {
    //create the database if it does not exist
    network: Network
    projectAddress: string
    numAssets: number
    ticker: string
}

//sample 
//npm run cli:dev hc create-assembler-config
