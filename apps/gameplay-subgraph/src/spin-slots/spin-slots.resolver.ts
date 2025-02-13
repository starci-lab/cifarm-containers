import { Logger } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { SpinSlotsService } from "./spin-slots.service"
import { SpinSlotSchema } from "@src/databases"

@Resolver()
export class SpinSlotsResolver {
    private readonly logger = new Logger(SpinSlotsResolver.name)

    constructor(private readonly spinSlotsService: SpinSlotsService) {}

    @Query(() => [SpinSlotSchema], {
        name: "spinSlots"
    })
    async spinSlots(): Promise<Array<SpinSlotSchema>> {
        return this.spinSlotsService.getSpinSlots()
    }

    @Query(() => SpinSlotSchema, {
        name: "spinSlot",
        nullable: true
    })
    async spinSlot(@Args("id", { type: () => ID }) id: string): Promise<SpinSlotSchema> {
        return this.spinSlotsService.getSpinSlot(id)
    }
}
