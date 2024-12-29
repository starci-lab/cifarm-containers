import { Global, Module } from "@nestjs/common"
import { EnergyService } from "./energy.service"

@Global()
@Module({
    imports: [],
    providers: [EnergyService],
    exports: [EnergyService]
})
export class EnergyModule {}
