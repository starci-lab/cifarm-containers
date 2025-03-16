import { Logger, UseGuards } from "@nestjs/common"
import { ThiefCropService } from "./thief-crop.service"
import { ThiefCropRequest, ThiefCropResponse } from "./thief-crop.dto"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLUser } from "@src/decorators"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"

@Resolver()
export class ThiefCropResolver {
    private readonly logger = new Logger(ThiefCropResolver.name)

    constructor(private readonly thiefCropService : ThiefCropService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => ThiefCropResponse, { name: "thiefCrop" })
    public async thiefCrop(
        @GraphQLUser() user: UserLike,
        @Args("request") request: ThiefCropRequest
    ) {
        return this.thiefCropService.thiefCrop(user, request)
    }
}
