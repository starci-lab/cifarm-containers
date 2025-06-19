import { Logger, UseGuards } from "@nestjs/common"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { UpdateDisplayInformationService } from "./update-display-information.service"
import { GraphQLThrottlerGuard } from "@src/throttler"
import {
    UpdateDisplayInformationRequest,
    UpdateDisplayInformationResponse
} from "./update-display-information.dto"

@Resolver()
export class UpdateDisplayInformationResolver {
    private readonly logger = new Logger(UpdateDisplayInformationResolver.name)

    constructor(
        private readonly updateDisplayInformationService: UpdateDisplayInformationService
    ) {}

    @UseGuards(GraphQLJwtAuthGuard, GraphQLThrottlerGuard)
    @Mutation(() => UpdateDisplayInformationResponse, {
        name: "updateDisplayInformation",
        description: "Update display information",
        nullable: true
    })
    public async updateDisplayInformation(
        @GraphQLUser() user: UserLike,
        @Args("request") request: UpdateDisplayInformationRequest
    ) {
        return this.updateDisplayInformationService.updateDisplayInformation(user, request)
    }
}
