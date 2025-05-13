import { Logger, UseGuards } from "@nestjs/common"
import { AuthenticateGoogleRequest, AuthenticateGoogleTokenResponse } from "./authenticate-google.dto"
import { AuthenticateGoogleService } from "./authenticate-google.service"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLThrottlerGuard } from "@src/throttler"

@Resolver()
export class AuthenticateGoogleResolver {
    private readonly logger = new Logger(AuthenticateGoogleResolver.name)

    constructor(private readonly authenticateGoogleService: AuthenticateGoogleService) {}

    @UseGuards(GraphQLThrottlerGuard)
    @Mutation(() => AuthenticateGoogleTokenResponse, {
        name: "authenticateGoogle",
        description: "Authenticate a google token"
    })
    public async authenticateGoogle(@Args("request") request: AuthenticateGoogleRequest) {
        return this.authenticateGoogleService.authenticateGoogle(request)
    }
}
