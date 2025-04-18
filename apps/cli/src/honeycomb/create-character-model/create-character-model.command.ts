import { CommandRunner, SubCommand, Option } from "nest-commander"
import { Logger } from "@nestjs/common"
import { Network } from "@src/env"
import { HoneycombService } from "@src/honeycomb"
import { MintAsKind } from "@honeycomb-protocol/edge-client"

@SubCommand({ name: "create-character-model", description: "Create the honeycomb character model" })
export class CreateCharacterModelCommand extends CommandRunner {
    private readonly logger = new Logger(CreateCharacterModelCommand.name)

    constructor(private readonly honeycombService: HoneycombService) {
        super()
    }

    async run(_: Array<string>, options?: CreateCharacterModelCommandOptions): Promise<void> {
        console.log(options)
        const { network, projectAddress, mintAsKind, collectionAddress } = options
        this.logger.debug("Creating the character model...")
        const { txResponse, characterModelAddress } =
            await this.honeycombService.createCreateCharacterModelTransaction({
                network,
                projectAddress,
                mintAs: {
                    kind: mintAsKind
                },
                config: {
                    kind: "Wrapped",
                    criterias: [
                        {
                            kind: "Collection",
                            params: collectionAddress
                        }
                    ]
                },
                attributes: [],
                cooldown: {
                    ejection: 0
                }
            })
        const response = await this.honeycombService.sendTransaction({
            network,
            txResponse
        })
        const { signature, status, error } = response 

        if (status.trim().toLowerCase() === "success") {
            this.logger.debug(`Character model created with txHash: ${signature}`)
            this.logger.debug(`Character model address: ${characterModelAddress}`)
        } else {
            this.logger.error(error)
            this.logger.error(`Failed to create the character model: ${error}`)
        }
    }

    @Option({
        flags: "-mak, --mintAsKind <mintAsKind>",
        description: "Mint as",
        defaultValue: MintAsKind.MplCore
    })
    parseMintAsKind(mintAsKind: string): MintAsKind {
        return mintAsKind as MintAsKind
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
        flags: "-ca, --collectionAddress <collectionAddress>",
        description: "Collection address",
        defaultValue: "FkJJyaMCMmNHGWQkBkrVBo9Trz8o9ZffKBcpyC3SdZx4"
    })
    parseCollectionAddress(collectionAddress: string): string {
        return collectionAddress
    }
}

export interface CreateCharacterModelCommandOptions {
    //create the database if it does not exist
    network: Network
    projectAddress: string
    mintAsKind: MintAsKind  
    collectionAddress: string
}
