import { Logger, UseGuards } from "@nestjs/common"
import { CureAnimalRequest } from "./cure-animal.dto"
import { CureAnimalService } from "./cure-animal.service"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { UserLike } from "@src/jwt"
import { EmptyObjectType } from "@src/common"   

@Resolver()
export class CureAnimalResolver {
    private readonly logger = new Logger(CureAnimalResolver.name)

    constructor(private readonly cureAnimalService: CureAnimalService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => EmptyObjectType, { name: "cureAnimal" })
    public async cureAnimal(
        @GraphQLUser() user: UserLike,
        @Args("request") request: CureAnimalRequest
    ) {
        return this.cureAnimalService.cureAnimal(user, request)
    }
}
