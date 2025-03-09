import { Module } from "@nestjs/common"
import { EnergyConsumer } from "./energy.consumer"
import { EnergyGateway } from "./energy.gateway"
import { AuthModule } from "../auth"

@Module({
    imports: [ AuthModule ],
    providers: [ EnergyGateway, EnergyConsumer ]
})
export class EnergyModule {}
