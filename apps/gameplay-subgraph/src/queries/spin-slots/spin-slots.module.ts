import { Module } from "@nestjs/common"
import { SpinSlotsResolver } from "./spin-slots.resolver"
import { SpinSlotsService } from "./spin-slots.service"

@Module({
    providers: [SpinSlotsService, SpinSlotsResolver]
})
export class SpinSlotsModule {}