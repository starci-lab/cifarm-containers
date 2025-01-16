import { Logger } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { SpinSlotsService } from "./spin-slots.service"
import { SpinSlotEntity } from "@src/databases"

@Resolver()
export class SpinSlotsResolver {
    private readonly logger = new Logger(SpinSlotsResolver.name)

    constructor(private readonly spinSlotsService: SpinSlotsService) {}

    @Query(() => [SpinSlotEntity], {
        name: "spinSlots"
    })
    async getSpinSlots(): Promise<Array<SpinSlotEntity>> {
        return this.spinSlotsService.getSpinSlots()
    }

    @Query(() => SpinSlotEntity, {
        name: "spinSlot",
        nullable: true
    })
    async getSpinSlot(@Args("id", { type: () => ID }) id: string): Promise<SpinSlotEntity> {
        return this.spinSlotsService.getSpinSlot(id)
    }
}
