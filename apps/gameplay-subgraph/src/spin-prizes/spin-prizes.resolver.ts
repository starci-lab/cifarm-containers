import { Logger } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { SpinPrizesService } from "./spin-prizes.service"
import { SpinPrizeEntity } from "@src/databases"

@Resolver()
export class SpinPrizeResolver {
    private readonly logger = new Logger(SpinPrizeResolver.name)

    constructor(private readonly spinPrizesService: SpinPrizesService) {}

    @Query(() => [SpinPrizeEntity], {
        name: "spinPrizes"
    })
    async getPlacedItemTypes(): Promise<Array<SpinPrizeEntity>> {
        return this.spinPrizesService.getSpinPrizes()
    }

    @Query(() => SpinPrizeEntity, {
        name: "spinPrize",
        nullable: true
    })
    async getPlacedItemType(@Args("id", { type: () => ID }) id: string): Promise<SpinPrizeEntity> {
        return this.spinPrizesService.getSpinPrize(id)
    }
}
