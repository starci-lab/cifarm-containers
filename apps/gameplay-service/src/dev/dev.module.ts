import { Module } from "@nestjs/common"
import { SpeedUpModule } from "./speed-up"

@Module({
    imports: [SpeedUpModule]
})
export class DevModule {}
