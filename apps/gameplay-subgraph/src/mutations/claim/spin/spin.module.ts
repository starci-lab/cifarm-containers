import { Module } from "@nestjs/common"
import { SpinResolver } from "./spin.resolver"
import { SpinService } from "./spin.service"

@Module({
    providers: [SpinService, SpinResolver]
})
export class SpinModule {}
