import { Logger, UseGuards } from "@nestjs/common"
import { HelpWaterCropService } from "./help-water-crop.service"
import { HelpWaterCropRequest } from "./help-water-crop.dto"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { VoidResolver } from "graphql-scalars"

@Resolver()
export class HelpWaterCropResolver {
    private readonly logger = new Logger(HelpWaterCropResolver.name)

    constructor(private readonly helpWaterCropService: HelpWaterCropService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => VoidResolver, {
        name: "helpWaterCrop",
        description: "Help water a placed item",
        nullable: true
    })
    public async helpWaterCrop(
        @GraphQLUser() user: UserLike,
        @Args("request") request: HelpWaterCropRequest
    ) {
        return this.helpWaterCropService.helpWaterCrop(user, request)
    }
}
