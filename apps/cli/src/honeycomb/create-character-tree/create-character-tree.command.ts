import { CommandRunner, SubCommand, Option } from "nest-commander"
import { Logger } from "@nestjs/common"
import { Network } from "@src/env"
import { HoneycombService } from "@src/honeycomb"

@SubCommand({ name: "create-character-tree", description: "Create the honeycomb character tree" })
export class CreateCharacterTreeCommand extends CommandRunner {
    private readonly logger = new Logger(CreateCharacterTreeCommand.name)

    constructor(private readonly honeycombService: HoneycombService) {
        super()
    }

    async run(_: Array<string>, options?: CreateCharacterModelCommandOptions): Promise<void> {
        const {
            network,
            projectAddress,
            characterModelAddress,
            numAssets,
        } = options
        this.logger.debug("Creating the character tree...")
        const { txResponse, treeAddress } = await this.honeycombService.createCreateCharactersTreeTransaction({
            network,
            projectAddress,
            characterModel: characterModelAddress,
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
            this.logger.debug(`Character tree created with txHash: ${signature}`)
            this.logger.debug(`Tree address: ${treeAddress}`)
        } else {
            this.logger.error(error)
            this.logger.error(`Failed to create the character model: ${error}`)
        }
    }

    @Option({
        flags: "-na, --numAssets <numAssets>",
        description: "Number of assets",
        defaultValue: 100000
    })
    parseNumAssets(numAssets: string): number {
        return parseInt(numAssets)
    }

    @Option({
        flags: "-c, --characterModelAddress <characterModelAddress>",
        description: "Character model address",
        defaultValue: "AuHyybLoYrHFHy3D6rPkoc9Dn7VPPD2sYcTm4wJgVvCe"
    })
    parseCharacterModelAddress(characterModelAddress: string): string {
        return characterModelAddress
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
    parseNetwork(network: string): Network {
        return network as Network
    }
}

export interface CreateCharacterModelCommandOptions {
    //create the database if it does not exist
    network: Network
    projectAddress: string
    characterModelAddress: string
    numAssets: number
}

//sample
//npm run cli:dev hc create-character-tree
