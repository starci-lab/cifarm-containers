import { Logger, UseGuards } from "@nestjs/common"
import { HelpCureAnimalService } from "./help-cure-animal.service"
import { HelpCureAnimalRequest } from "./help-cure-animal.dto"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLUser } from "@src/decorators"
import { VoidResolver } from "graphql-scalars"

@Resolver()
export class HelpCureAnimalResolver {
    private readonly logger = new Logger(HelpCureAnimalResolver.name)

    constructor(private readonly helpCureAnimalService: HelpCureAnimalService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => VoidResolver, {
        name: "helpCureAnimal",
        description: "Help cure an animal",
        nullable: true
    })
    public async helpCureAnimal(
        @GraphQLUser() user: UserLike,
        @Args("request") request: HelpCureAnimalRequest
    ) {
        return this.helpCureAnimalService.helpCureAnimal(user, request)
    }
}
