import { Logger, UseGuards } from "@nestjs/common"
import { Resolver, Mutation, Args } from "@nestjs/graphql"
import { LogoutRequest, LogoutResponse } from "./logout.dto"
import { LogoutService } from "./logout.service"
import { GraphQLThrottlerGuard } from "@src/throttler"

@Resolver()
export class LogoutResolver {
    private readonly logger = new Logger(LogoutResolver.name)

    constructor(private readonly logoutService: LogoutService) {}

    @UseGuards(GraphQLThrottlerGuard)
    @Mutation(() => LogoutResponse, {
        name: "logout",
        description: "Logout a user by invalidating their refresh token"
    })
    public async logout(@Args("request") request: LogoutRequest) {
        return this.logoutService.logout(request)
    }
} 