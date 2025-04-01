import { Logger, UseGuards } from "@nestjs/common"
import { RefreshService } from "./refresh.service"
import { RefreshRequest, RefreshResponse } from "./refresh.dto"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLThrottlerGuard } from "@src/throttler"

@Resolver()
export class RefreshResolver {
    private readonly logger = new Logger(RefreshResolver.name)

    constructor(private readonly refreshService: RefreshService) {}

    @UseGuards(GraphQLThrottlerGuard)
    @Mutation(() => RefreshResponse, { name: "refresh", description: "Refresh a user's session" })
    public async refresh(@Args("request") request: RefreshRequest) {
        return this.refreshService.refresh(request)
    }
}
