import { Module } from "@nestjs/common"
import { SpeedUpModule } from "./speed-up"
import { DeliverProductModule } from "../delivery"

@Module({
    imports: [SpeedUpModule, DeliverProductModule]
})
export class DevModule {}
