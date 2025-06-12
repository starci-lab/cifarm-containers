import { Logger, UseGuards } from "@nestjs/common"
import { Resolver, Query, Args } from "@nestjs/graphql"
import { GraphQLVaultService } from "./vault.service"
import { GraphQLThrottlerGuard } from "@src/throttler"
import { GetVaultCurrentResponse } from "./vault.dto"
import { GetVaultCurrentRequest } from "./vault.dto"

@Resolver()
export class VaultResolver {
    private readonly logger = new Logger(VaultResolver.name)
    constructor(private readonly vaultService: GraphQLVaultService) {}

    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => GetVaultCurrentResponse, {
        name: "vaultCurrent",
        description: "Get the vault current information"
    })
    async vaultCurrent(
        @Args("request", { type: () => GetVaultCurrentRequest })
            request: GetVaultCurrentRequest
    ): Promise<GetVaultCurrentResponse> {
        return this.vaultService.vaultCurrent(request)
    }
}
