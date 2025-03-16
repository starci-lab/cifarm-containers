import { Logger, UseGuards } from "@nestjs/common"
import { HelpCureAnimalService } from "./help-cure-animal.service"
import { HelpCureAnimalRequest } from "./help-cure-animal.dto"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLUser } from "@src/decorators"
import { EmptyObjectType } from "@src/common"

@Resolver()
export class HelpCureAnimalResolver {
    private readonly logger = new Logger(HelpCureAnimalResolver.name)

    constructor(private readonly helpCureAnimalService: HelpCureAnimalService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => EmptyObjectType, { name: "helpCureAnimal" })
    public async helpCureAnimal(
        @GraphQLUser() user: UserLike,
        @Args("request") request: HelpCureAnimalRequest
    ) {
        return await this.helpCureAnimalService.helpCureAnimal(user, request)
    }
}
