import { Logger, UseGuards } from "@nestjs/common"
import { BuyAnimalRequest } from "./buy-animal.dto"
import { BuyAnimalService } from "./buy-animal.service"
import { Args, Resolver } from "@nestjs/graphql"
import { UserLike } from "@src/jwt"
import { GraphQLJwtAuthGuard } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { Mutation } from "@nestjs/graphql"
import { VoidResolver } from "graphql-scalars"

@Resolver()
export class BuyAnimalResolver {
    private readonly logger = new Logger(BuyAnimalResolver.name)

    constructor(private readonly buyAnimalService: BuyAnimalService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => VoidResolver, {
        name: "buyAnimal",
        description: "Buy an animal",
        nullable: true
    })
    public async buyAnimal(
        @GraphQLUser() user: UserLike,
        @Args("request") request: BuyAnimalRequest
    ) {
        return await this.buyAnimalService.buyAnimal(user, request)
    }
}
