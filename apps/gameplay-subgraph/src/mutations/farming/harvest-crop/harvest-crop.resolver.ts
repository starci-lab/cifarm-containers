import { Logger, UseGuards } from "@nestjs/common"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { UserLike } from "@src/jwt"
import { HarvestCropRequest, HarvestCropResponse } from "./harvest-crop.dto"
import { HarvestCropService } from "./harvest-crop.service"


@Resolver()
export class HarvestCropResolver {
    private readonly logger = new Logger(HarvestCropResolver.name)

    constructor(private readonly harvestCropService: HarvestCropService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => HarvestCropResponse, { name: "harvestCrop" })
    public async harvestCrop(
        @GraphQLUser() user: UserLike,
        @Args("request") request: HarvestCropRequest
    ) {
        return this.harvestCropService.harvestCrop(user, request)
    }
}
