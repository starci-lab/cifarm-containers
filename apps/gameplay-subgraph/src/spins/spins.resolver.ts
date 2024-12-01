import { Logger } from "@nestjs/common"
import { Args, Query, Resolver } from "@nestjs/graphql"
import { GetSpinsArgs } from "./"
import { SpinsService } from "./spins.service"
import { SpinSlotEntity } from "@src/database"

@Resolver()
export class SpinsResolver {
    private readonly logger = new Logger(SpinsResolver.name)

    constructor(private readonly spinsService: SpinsService) {}

    @Query(() => [SpinSlotEntity], {
        name: "spins"
    })
    async getSpins(@Args("args") args: GetSpinsArgs): Promise<Array<SpinSlotEntity>> {
        return this.spinsService.getSpins(args)
    }
}
