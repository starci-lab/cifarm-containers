import { Logger, UseGuards } from "@nestjs/common"
import { SpinService } from "./spin.service"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { Mutation, Resolver } from "@nestjs/graphql"
import { SpinResponse } from "./spin.dto"
import { GraphQLUser } from "@src/decorators"

@Resolver()
export class SpinResolver {
    private readonly logger = new Logger(SpinResolver.name)

    constructor(private readonly spinService: SpinService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => SpinResponse, { name: "spin" })
    public async spin(@GraphQLUser() user: UserLike) {
        return this.spinService.spin(user)
    }
}
