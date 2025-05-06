import { Logger, UseGuards } from "@nestjs/common"
import { ValidateGoogleTokenRequest, ValidateGoogleTokenResponse } from "./validate-google-token.dto"
import { ValidateGoogleTokenService } from "./validate-google-token.service"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLThrottlerGuard } from "@src/throttler"

@Resolver()
export class ValidateGoogleTokenResolver {
    private readonly logger = new Logger(ValidateGoogleTokenResolver.name)

    constructor(private readonly validateGoogleTokenService: ValidateGoogleTokenService) {}

    @UseGuards(GraphQLThrottlerGuard)
    @Mutation(() => ValidateGoogleTokenResponse, {
        name: "validateGoogleToken",
        description: "Validate a google token"
    })
    public async validateGoogleToken(@Args("request") request: ValidateGoogleTokenRequest) {
        return this.validateGoogleTokenService.validateGoogleToken(request)
    }
}
