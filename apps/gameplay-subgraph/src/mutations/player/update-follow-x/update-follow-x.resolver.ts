import { Logger, UseGuards } from "@nestjs/common"
import { Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { VoidResolver } from "graphql-scalars"
import { UpdateFollowXService } from "./update-follow-x.service"
import { GraphQLThrottlerGuard } from "@src/throttler"



@Resolver()
export class UpdateFollowXResolver {
    private readonly logger = new Logger(UpdateFollowXResolver.name)

    constructor(private readonly updateFollowXService: UpdateFollowXService) {}

    
    @UseGuards(GraphQLJwtAuthGuard, GraphQLThrottlerGuard)
    @Mutation(() => VoidResolver, {
        name: "updateFollowX",
        description: "Update follow X",
        nullable: true
    })
    public async updateFollowX(@GraphQLUser() user: UserLike) {
        return this.updateFollowXService.updateFollowX(user)
    }
}
