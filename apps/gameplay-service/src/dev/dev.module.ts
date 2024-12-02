import { Module } from "@nestjs/common"
import { SpeedUpModule } from "./speed-up"
import { DeliveryInstantlyModule } from "./deliver-instantly"

@Module({
    imports: [SpeedUpModule, DeliveryInstantlyModule]
})
export class DevModule {}
