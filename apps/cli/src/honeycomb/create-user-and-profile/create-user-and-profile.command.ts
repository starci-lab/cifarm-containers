import { CommandRunner, SubCommand, Option } from "nest-commander"
import { Logger } from "@nestjs/common"
import { Network } from "@src/env"
import { HoneycombService } from "@src/honeycomb"

@SubCommand({ name: "create-profiles-tree", description: "Create the honeycomb profiles tree" })
export class CreateProfilesTreeCommand extends CommandRunner {
    private readonly logger = new Logger(CreateProfilesTreeCommand.name)

    constructor(
        private readonly honeycombService: HoneycombService
    ) {
        super()
    }

    async run(_: Array<string>, options?: CreateProfilesTreeCommandOptions): Promise<void> {
        const { network, projectAddress, numAssets } = options
        this.logger.debug("Creating the profiles tree...")
        const { txResponse, treeAddress } = await this.honeycombService.createCreateProfilesTreeTransaction({
            network,
            projectAddress,
            numAssets
        })
        const { signature, status, error } = await this.honeycombService.sendTransaction({
            network,
            txResponse
        })
        if (status.trim().toLowerCase() === "success") {
            this.logger.debug(`Profiles tree created with txHash: ${signature}`)
            this.logger.debug(`Profiles tree address: ${treeAddress}`)
        } else {
            this.logger.error(error)
            this.logger.error(`Failed to create the profiles tree: ${error}`)
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
        flags: "-n, --numAssets <numAssets>",
        description: "Number of assets",
        defaultValue: 100000
    })
    parseNumAssets(numAssets: string): number {
        return parseInt(numAssets)
    }
}

export interface CreateProfilesTreeCommandOptions {
    //create the database if it does not exist
    network: Network
    projectAddress: string
    numAssets: number
}
