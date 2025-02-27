import { CommandRunner, SubCommand, Option } from "nest-commander"
import { Logger } from "@nestjs/common"
import { HoneycombService } from "@src/honeycomb"
import { Network } from "@src/env"

@SubCommand({ name: "create-project", description: "Create the honeycomb project" })
export class CreateProjectCommand extends CommandRunner {
    private readonly logger = new Logger(CreateProjectCommand.name)

    constructor(
        private readonly honeycombService: HoneycombService
    ) {
        super()
    }

    async run(_: Array<string>, options?: CreateProjectCommandOptions): Promise<void> {
        console.log(options)
        this.logger.debug("Creating the project...")
        try {
            const { projectAddress, txResponse } = await this.honeycombService.createCreateCreateProjectTransaction({
                network: options.network,
                projectName: options.projectName,
            })
            const { signature } = await this.honeycombService.sendTransaction({
                network: options.network,
                txResponse
            })
            this.logger.verbose(`Project created with txHash: ${signature}`)
            this.logger.verbose(`Project address: ${projectAddress}`)
        } catch (error) {
            this.logger.error(`Failed to create the project: ${error.message}`)
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
        flags: "-pn, --project-name <projectName>",
        description: "Project name",
        defaultValue: "CiFarm"
    })
    parseProjectName(projectName: string): string {
        return projectName
    }
}

export interface CreateProjectCommandOptions {
    //create the database if it does not exist
    network: Network
    projectName: string
}
