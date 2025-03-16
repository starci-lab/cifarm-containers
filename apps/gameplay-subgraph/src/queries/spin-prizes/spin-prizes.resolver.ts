import { Logger } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { SpinPrizesService } from "./spin-prizes.service"
import { SpinPrizeSchema } from "@src/databases"
@Resolver()
export class SpinPrizeResolver {
    private readonly logger = new Logger(SpinPrizeResolver.name)

    constructor(private readonly spinPrizesService: SpinPrizesService) {}

    @Query(() => [SpinPrizeSchema], {
        name: "spinPrizes"
    })
    async spinPrizes(): Promise<Array<SpinPrizeSchema>> {
        return this.spinPrizesService.getSpinPrizes()
    }

    @Query(() => SpinPrizeSchema, {
        name: "spinPrize",
        nullable: true
    })
    async spinPrize(@Args("id", { type: () => ID }) id: string): Promise<SpinPrizeSchema> {
        return this.spinPrizesService.getSpinPrize(id)
    }
}
