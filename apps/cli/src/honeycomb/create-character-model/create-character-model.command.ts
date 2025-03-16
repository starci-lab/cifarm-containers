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
        const {
            network,
            projectAddress,
            assemblerConfigAddress,
            mintAsKind,
            collectionName,
            name,
            creatorAddress,
            symbol,
            description
        } = options
        this.logger.debug("Creating the character model...")
        const { txResponse, characterModelAddress } = await this.honeycombService.createCreateCharacterModelTransaction({
            network,
            projectAddress,
            mintAs: {
                kind: mintAsKind
            },
            config: {
                kind: "Assembled",
                assemblerConfigInput: {
                    assemblerConfig: assemblerConfigAddress,
                    collectionName,
                    name,
                    creators: [
                        {
                            address: creatorAddress,
                            share: 100
                        }
                    ],
                    description,
                    sellerFeeBasisPoints: 0,
                    symbol
                }
            },
            payerAddress: creatorAddress,
            attributes: [],
            cooldown: {
                ejection: 0
            }
        })
        const { signature, status, error } = await this.honeycombService.sendTransaction({
            network,
            txResponse
        })
        if (status.trim().toLowerCase() === "success") {
            this.logger.debug(`Character model created with txHash: ${signature}`)
            this.logger.debug(`Character model address: ${characterModelAddress}`)
        } else {
            this.logger.error(error)
            this.logger.error(`Failed to create the character model: ${error}`)
        }
    }

    @Option({
        flags: "-s, --symbol <symbol>",
        description: "Symbol",
        defaultValue: "CIFARMFRUIT"
    })
    parseSymbol(symbol: string): string {
        return symbol
    }

    @Option({
        flags: "-d, --description <description>",
        description: "Description",
        defaultValue: "CiFarm Fruit collection"
    })
    parseDescription(description: string): string {
        return description
    }

    @Option({
        flags: "-a, --assemblerConfigAddress <assemblerConfigAddress>",
        description: "Assembler config address",
        defaultValue: "3PQRrZjX2zMoFPYmf2RYgxfss4TaeTpFa7R1KnJopEFe"
    })
    parseAssemblerConfigAddress(assemblerConfigAddress: string): string {
        return assemblerConfigAddress
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
        flags: "-na, --numAssets <numAssets>",
        description: "Number of assets",
        defaultValue: 100000
    })
    parseNumAssets(numAssets: string): number {
        return parseInt(numAssets)
    }

    @Option({
        flags: "-c, --creatorAddress <creatorAddress>",
        description: "Creator address",
        defaultValue: "QVeEob5S8U47rwSH6wMsPRiFDPCcQ3wPqBgfjQQd8aX"
    })
    parseCreatorAddress(creatorAddress: string): string {
        return creatorAddress
    }

    @Option({
        flags: "--name <name>",
        description: "Name",
        defaultValue: "Apple 0"
    })
    parseName(name: string): string {
        return name
    }

    @Option({
        flags: "-cn,--collectionName <collectionName>",
        description: "Collection name",
        defaultValue: "CiFarm Fruit"
    })
    parseCollectionName(collectionName: string): string {
        return collectionName
    }
}

export interface CreateCharacterModelCommandOptions {
    //create the database if it does not exist
    network: Network
    projectAddress: string
    numAssets: number
    ticker: string
    mintAsKind: MintAsKind
    mintAsAddress: string
    assemblerConfigAddress: string
    collectionName: string
    name: string
    creatorAddress: string
    symbol: string
    description: string
}

//sample
//npm run cli:dev hc create-character-model
