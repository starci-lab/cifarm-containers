import { Logger, UseGuards } from "@nestjs/common"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { UseWateringCanService } from "./use-watering-can.service"
import { UseWateringCanRequest } from "./use-watering-can.dto"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { VoidResolver } from "graphql-scalars"

@Resolver()
export class UseWateringCanResolver {
    private readonly logger = new Logger(UseWateringCanResolver.name)
    
    constructor(private readonly useWateringCanService: UseWateringCanService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => VoidResolver, { name: "useWateringCan", description: "Use watering can", nullable: true })     
    public async useWateringCan(
        @GraphQLUser() user: UserLike,
        @Args("request") request: UseWateringCanRequest
    ): Promise<void> {
        return this.useWateringCanService.useWateringCan(user, request)
    }
}
