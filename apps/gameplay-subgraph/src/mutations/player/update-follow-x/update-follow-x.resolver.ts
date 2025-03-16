import { Logger, UseGuards } from "@nestjs/common"
import { Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { EmptyObjectType } from "@src/common"
import { UpdateFollowXService } from "./update-follow-x.service"

@Resolver()
export class UpdateFollowXResolver {
    private readonly logger = new Logger(UpdateFollowXResolver.name)

    constructor(private readonly updateFollowXService: UpdateFollowXService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => EmptyObjectType, { name: "updateFollowX" })
    public async updateFollowX(@GraphQLUser() user: UserLike) {
        return this.updateFollowXService.updateFollowX(user)
    }
}
