import { Module } from "@nestjs/common"
import { EnergyController } from "./energy.controller"
import { EnergyGateway } from "./energy.gateway"
import { AuthModule } from "../auth"

@Module({
    imports: [ AuthModule ],
    controllers: [ EnergyController ],
    providers: [ EnergyGateway ]
})
export class EnergyModule {}
