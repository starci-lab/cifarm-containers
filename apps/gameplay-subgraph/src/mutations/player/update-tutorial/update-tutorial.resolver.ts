import { Logger, UseGuards } from "@nestjs/common"
import { UpdateTutorialService } from "./update-tutorial.service"
import { Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { VoidResolver } from "graphql-scalars"

@Resolver()
export class UpdateTutorialResolver {
    private readonly logger = new Logger(UpdateTutorialResolver.name)

    constructor(private readonly updateTutorialService: UpdateTutorialService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => VoidResolver, { name: "updateTutorial", description: "Update the tutorial step" })
    public async updateTutorial(
        @GraphQLUser() user: UserLike
    ) {
        await this.updateTutorialService.updateTutorial(user)
    }
}
