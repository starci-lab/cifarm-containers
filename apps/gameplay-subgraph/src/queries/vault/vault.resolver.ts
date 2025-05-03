import { Logger, UseGuards } from "@nestjs/common"
import { Resolver, Query, Args } from "@nestjs/graphql"
import { GraphQLVaultService } from "./vault.service"
import { GraphQLThrottlerGuard } from "@src/throttler"
import { VaultCurrentResponse } from "./vault.dto"
import { VaultCurrentRequest } from "./vault.dto"

@Resolver()
export class VaultResolver {
    private readonly logger = new Logger(VaultResolver.name)
    constructor(private readonly vaultService: GraphQLVaultService) {}

    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => VaultCurrentResponse, {
        name: "vaultCurrent",
        description: "Get the vault current information"
    })
    async vaultCurrent(
        @Args("request", { type: () => VaultCurrentRequest })
            request: VaultCurrentRequest
    ): Promise<VaultCurrentResponse> {
        return this.vaultService.vaultCurrent(request)
    }
}
