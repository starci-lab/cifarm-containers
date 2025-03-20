import { Logger } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { SpinSlotsService } from "./spin-slots.service"
import { SpinSlotSchema } from "@src/databases"

@Resolver()
export class SpinSlotsResolver {
    private readonly logger = new Logger(SpinSlotsResolver.name)

    constructor(private readonly spinSlotsService: SpinSlotsService) {}

    @Query(() => [SpinSlotSchema], {
        name: "spinSlots",
        description: "Get all spin slots"
    })
    async spinSlots(): Promise<Array<SpinSlotSchema>> {
        return this.spinSlotsService.spinSlots()
    }

    @Query(() => SpinSlotSchema, {
        name: "spinSlot",
        description: "Get a spin slot by ID"
    })
    async spinSlot(
        @Args("id", { type: () => ID, description: "The ID of the spin slot" }) id: string
    ): Promise<SpinSlotSchema> {
        return this.spinSlotsService.spinSlot(id)
    }
}
