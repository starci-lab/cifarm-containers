import { Logger, UseGuards } from "@nestjs/common"
import { MoveInventoryService } from "./move-inventory.service"
import { MoveInventoryRequest } from "./move-inventory.dto"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { EmptyObjectType } from "@src/common"

@Resolver()
export class MoveInventoryResolver {
    private readonly logger = new Logger(MoveInventoryResolver.name)

    constructor(private readonly moveInventoryService : MoveInventoryService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => EmptyObjectType, { name: "moveInventory" })
    public async moveInventory(
        @GraphQLUser() user: UserLike,
        @Args("request") request: MoveInventoryRequest
    ) {
        return this.moveInventoryService.moveInventory(user, request)
    }
}
