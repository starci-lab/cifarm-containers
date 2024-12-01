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
        name: "spin_slots"
    })
    async getSpins(@Args("args") args: GetSpinsArgs): Promise<Array<SpinSlotEntity>> {
        return this.spinsService.getSpins(args)
    }

     @Query(() => SpinSlotEntity, {
         name: "spin_slot",
         nullable:true
     })
    async getSpinSlotById(@Args("id") id: string): Promise<SpinSlotEntity | null> {
        this.logger.debug(`getSpinSlotById: id=${id}`)
        return this.spinsService.getSpinSlotById(id)
    }
}
