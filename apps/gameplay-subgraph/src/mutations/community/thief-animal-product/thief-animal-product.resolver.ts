import { Logger, UseGuards } from "@nestjs/common"
import { ThiefAnimalProductService } from "./thief-animal-product.service"
import { ThiefAnimalProductRequest, ThiefAnimalProductResponse } from "./thief-animal-product.dto"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLUser } from "@src/decorators"
import { UserLike } from "@src/jwt"
import { GraphQLJwtAuthGuard } from "@src/jwt"

@Resolver()
export class ThiefAnimalProductResolver {
    private readonly logger = new Logger(ThiefAnimalProductResolver.name)

    constructor(private readonly thiefAnimalProductService: ThiefAnimalProductService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => ThiefAnimalProductResponse, {
        name: "thiefAnimalProduct",
        description: "Thief animal product",
        nullable: true
    })
    public async thiefAnimalProduct(
        @GraphQLUser() user: UserLike,
        @Args("request") request: ThiefAnimalProductRequest
    ) {
        return this.thiefAnimalProductService.thiefAnimalProduct(user, request)
    }
}
