import { Logger, UseGuards } from "@nestjs/common"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard } from "@src/jwt"
import { CreateSignedUrlService } from "./create-signed-url.service"
import { GraphQLThrottlerGuard } from "@src/throttler"
import { CreateSignedUrlRequest, CreateSignedUrlResponse } from "./create-signed-url.dto"

@Resolver()
export class CreateSignedUrlResolver {
    private readonly logger = new Logger(CreateSignedUrlResolver.name)

    constructor(private readonly createSignedUrlService: CreateSignedUrlService) {}

    @UseGuards(GraphQLJwtAuthGuard, GraphQLThrottlerGuard)
    @Mutation(() => CreateSignedUrlResponse, {
        name: "createSignedUrl",
        description: "Create signed url",
        nullable: true
    })
    public async createSignedUrl(
        @Args("request") request: CreateSignedUrlRequest
    ) {
        return this.createSignedUrlService.createSignedUrl(request)
    }
}
