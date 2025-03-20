import { Logger } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { SpinPrizesService } from "./spin-prizes.service"
import { SpinPrizeSchema } from "@src/databases"
@Resolver()
export class SpinPrizeResolver {
    private readonly logger = new Logger(SpinPrizeResolver.name)

    constructor(private readonly spinPrizesService: SpinPrizesService) {}

    @Query(() => [SpinPrizeSchema], {
        name: "spinPrizes",
        description: "Get all spin prizes"
    })
    async spinPrizes(): Promise<Array<SpinPrizeSchema>> {
        return this.spinPrizesService.spinPrizes()
    }

    @Query(() => SpinPrizeSchema, {
        name: "spinPrize",
        description: "Get a spin prize by ID"
    })
    async spinPrize(
        @Args("id", { type: () => ID, description: "The ID of the spin prize" }) id: string
    ): Promise<SpinPrizeSchema> {
        return this.spinPrizesService.spinPrize(id)
    }
}
