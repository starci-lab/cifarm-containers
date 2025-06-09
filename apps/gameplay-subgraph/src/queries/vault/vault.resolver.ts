import { Logger, UseGuards } from "@nestjs/common"
import { Resolver, Query } from "@nestjs/graphql"
import { GraphQLVaultService } from "./vault.service"
import { GraphQLThrottlerGuard } from "@src/throttler"
import { VaultCurrentResponse } from "./vault.dto"
import { GraphQLJwtAuthGuard } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { UserLike } from "@src/jwt"

@Resolver()
export class VaultResolver {
    private readonly logger = new Logger(VaultResolver.name)
    constructor(private readonly vaultService: GraphQLVaultService) {}

    @UseGuards(GraphQLThrottlerGuard, GraphQLJwtAuthGuard)
    @Query(() => VaultCurrentResponse, {
        name: "vaultCurrent",
        description: "Get the vault current information"
    })
    async vaultCurrent(
        @GraphQLUser()
            user: UserLike
    ): Promise<VaultCurrentResponse> {
        return this.vaultService.vaultCurrent(user)
    }
}
