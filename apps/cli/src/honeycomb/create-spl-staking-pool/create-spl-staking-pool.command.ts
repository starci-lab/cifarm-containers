import { CommandRunner, SubCommand, Option } from "nest-commander"
import { Logger } from "@nestjs/common"
import { Network } from "@src/env"
import { HoneycombService } from "@src/honeycomb"

@SubCommand({ name: "create-spl-staking-pool", description: "Create the honeycomb SPL staking pool" })
export class CreateSplStakingPoolCommand extends CommandRunner {
    private readonly logger = new Logger(CreateSplStakingPoolCommand.name)

    constructor(
        private readonly honeycombService: HoneycombService
    ) {
        super()
    }

    async run(_: Array<string>, options?: CreateSplStakingPoolCommandOptions): Promise<void> {
        const { network, stakingPoolName, projectAddress, maxStakeDurationSecs, minStakeDurationSecs, tokenAddress } = options
        this.logger.debug("Creating the SPL staking pool...")
        try {
            const { txResponse } = await this.honeycombService.createCreateSplStakingPoolTransaction({
                network,
                metadata: {
                    name: stakingPoolName,
                    maxStakeDurationSecs,
                    minStakeDurationSecs,
                    startTime: Date.now().toString(),
                    endTime: null
                },
                projectAddress,
                tokenAddress
            })
            const { signature, status, error } = await this.honeycombService.sendTransaction({
                network,
                txResponse
            })
            if (status === "success") {
                this.logger.debug(`Resource created with txHash: ${signature}`)
            } else {
                this.logger.error(`Failed to create the resource: ${error}`)
            }
        } catch (error) {
            console.log(error)
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
        flags: "-stn, --staking-pool-name <stakingPoolName>",
        description: "Staking pool name",
        defaultValue: "$CARROT Staking Pool"
    })
    parseStakingPoolName(stakingPoolName: string): string {
        return stakingPoolName
    }

    @Option({
        flags: "-pa, --project-address <projectAddress>",
        description: "Project address",
        defaultValue: "BoRbyNqh3YmYzzuFMLZ2kjFEC1whr4zS9wPskqp7uqZL"
    })
    parseProjectAddress(projectAddress: string): string {
        return projectAddress
    }


    @Option({
        flags: "-ra, --resource-address <resourceAddress>",
        description: "Resource address",
        defaultValue: "6JkqdDyrXsySvnvKBmFVpay9L413VXJcd78kFJ2XSABH"
    })
    parseResourceAddress(resourceAddress: string): string {
        return resourceAddress
    }

    @Option({
        flags: "-mssd, --max-stake-duration-secs <maxStakeDurationSecs>",
        description: "Maximum stake duration in seconds",
        defaultValue: (BigInt(1000) * BigInt(60) * BigInt(60) * BigInt(24) * BigInt(365)).toString() // 1 years
    })
    parseMaxStakeDurationSecs(maxStakeDurationSecs: string): string {
        return maxStakeDurationSecs
    }

    @Option({
        flags: "-msds, --min-stake-duration-secs <minStakeDurationSecs>",
        description: "Minimum stake duration in seconds",
        defaultValue: (BigInt(1000) * BigInt(60) * BigInt(60) * BigInt(24) * BigInt(30)).toString() // 30 days
    })
    parseMinStakeDurationSecs(minStakeDurationSecs: string): string {
        return minStakeDurationSecs
    }

    @Option({
        flags: "-ta, --token-address <tokenAddress>",
        description: "Token address",
        defaultValue: "DV9Bmb64Mqp9HfmKeSSRtvcQi25A2spotcYDMxqoNXRU"
    })
    parseTokenAddress(tokenAddress: string): string {
        return tokenAddress
    }
}

export interface CreateSplStakingPoolCommandOptions {
    //create the database if it does not exist
    network: Network
    stakingPoolName: string
    projectAddress: string
    maxStakeDurationSecs: string
    minStakeDurationSecs: string
    tokenAddress: string
}
