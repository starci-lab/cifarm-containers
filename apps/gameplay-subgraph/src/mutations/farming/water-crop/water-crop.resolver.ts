import { Logger, UseGuards } from "@nestjs/common"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { WaterCropService } from "./water-crop.service"
import { WaterCropRequest } from "./water-crop.dto"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { VoidResolver } from "graphql-scalars"

@Resolver()
export class WaterCropResolver {
    private readonly logger = new Logger(WaterCropResolver.name)
    
    constructor(private readonly waterService: WaterCropService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => VoidResolver, { name: "waterCrop" })     
    public async water(
        @GraphQLUser() user: UserLike,
        @Args("request") request: WaterCropRequest
    ): Promise<void> {
        return this.waterService.water(user, request)
    }
}
