import { CommandRunner, SubCommand, Option } from "nest-commander"
import { Logger } from "@nestjs/common"
import { Network } from "@src/env"
import { HoneycombService } from "@src/honeycomb"
import { ResourceStorageEnum } from "@honeycomb-protocol/edge-client"

@SubCommand({ name: "create-resource", description: "Create resource" })
export class CreateResourceCommand extends CommandRunner {
    private readonly logger = new Logger(CreateResourceCommand.name)

    constructor(
        private readonly honeycombService: HoneycombService
    ) {
        super()
    }

    async run(_: Array<string>, options?: CreateResourceCommandOptions): Promise<void> {
        this.logger.debug("Creating the resource...")
        try {
            const { resourceAddress, txResponse } = await this.honeycombService.createCreateResourceTransaction({
                network: options.network,
                name: options.name,
                symbol: options.symbol,
                decimals: options.decimals,
                uri: options.uri,
                projectAddress: options.projectAddress,
                storage: options.storage
            })
            console.log(resourceAddress)
            const { signature } = await this.honeycombService.sendTransaction({
                network: options.network,
                txResponse
            })
            this.logger.verbose(`Resource created with txHash: ${signature}`)
            this.logger.verbose(`Resource address: ${resourceAddress}`)
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
        description: "Resource name",
        defaultValue: "$CARROT"
    })
    parseName(name: string): string {
        return name
    }

    @Option({
        flags: "-s, --symbol <symbol>",
        description: "Resource symbol",
        defaultValue: "$CARROT"
    })
    parseSymbol(symbol: string): string {
        return symbol
    }

    @Option({
        flags: "-d, --decimals <decimals>",
        description: "Resource decimals",
        defaultValue: 6
    })
    parseDecimals(decimals: string): number {
        return parseInt(decimals)
    }

    @Option({
        flags: "-u, --uri <uri>",
        description: "Resource URI",
        defaultValue: "https://example.com"
    })
    parseUri(uri: string): string {
        return uri
    }

    @Option({
        flags: "-s, --storage <storage>",
        description: "Resource storage",
        defaultValue: ResourceStorageEnum.AccountState
    })
    parseStorage(storage: string): ResourceStorageEnum {
        return storage as ResourceStorageEnum
    }

    @Option({
        flags: "-pa, --project-address <projectAddress>",
        description: "Project address",
        defaultValue: "0x123"
    })
    parseProjectAddress(projectAddress: string): string {
        return projectAddress
    }
}

export interface CreateResourceCommandOptions {
    //create the database if it does not exist
    network: Network
    name: string
    symbol: string
    decimals: number
    uri: string
    storage: ResourceStorageEnum
    projectAddress: string
}
