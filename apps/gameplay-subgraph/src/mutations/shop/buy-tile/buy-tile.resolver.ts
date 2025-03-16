import { Logger, UseGuards } from "@nestjs/common"
import { BuyTileService } from "./buy-tile.service"
import { BuyTileRequest } from "./buy-tile.dto"
import { GraphQLJwtAuthGuard } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { UserLike } from "@src/jwt"     
import { VoidResolver } from "graphql-scalars"

@Resolver()
export class BuyTileResolver {
    private readonly logger = new Logger(BuyTileResolver.name)

    constructor(private readonly buyTileService: BuyTileService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => VoidResolver, {
        name: "buyTile",
        description: "Buy a tile",
        nullable: true
    })
    public async buyTile(
        @GraphQLUser() user: UserLike,
        @Args("request") request: BuyTileRequest
    ) {
        return this.buyTileService.buyTile(user, request)
    }
}
