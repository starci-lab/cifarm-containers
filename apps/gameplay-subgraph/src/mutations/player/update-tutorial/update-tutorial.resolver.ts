import { Logger, UseGuards } from "@nestjs/common"
import { UpdateTutorialService } from "./update-tutorial.service"
import { Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { EmptyObjectType } from "@src/common"

@Resolver()
export class UpdateTutorialResolver {
    private readonly logger = new Logger(UpdateTutorialResolver.name)

    constructor(private readonly updateTutorialService: UpdateTutorialService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => EmptyObjectType, { name: "updateTutorial" })
    public async updateTutorial(
        @GraphQLUser() user: UserLike
    ): Promise<EmptyObjectType> {
        return this.updateTutorialService.updateTutorial(user)
    }
}
