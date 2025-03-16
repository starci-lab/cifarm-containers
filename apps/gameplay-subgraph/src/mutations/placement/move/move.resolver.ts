import { Logger, UseGuards } from "@nestjs/common"
import { MoveService } from "./move.service"
import { MoveRequest } from "./move.dto"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { EmptyObjectType } from "@src/common"
import { GraphQLUser } from "@src/decorators"

@Resolver()
export class MoveResolver {
    private readonly logger = new Logger(MoveResolver.name)
    constructor(
            private readonly placementService: MoveService
    ){}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => EmptyObjectType, { name: "move" })
    public async move(@GraphQLUser() user: UserLike, @Args("request") request: MoveRequest) {
        return await this.placementService.move(user, request)
    }
    
}
