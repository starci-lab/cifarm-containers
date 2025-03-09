import { Controller, Logger } from "@nestjs/common"
import { EventPattern, Payload } from "@nestjs/microservices"
import { KafkaPattern } from "@src/brokers"
import { SyncEnergyPayload } from "./energy.types"
import { EnergyGateway } from "./energy.gateway"

@Controller()
export class EnergyController {
    private readonly logger = new Logger(EnergyController.name)

    constructor(private readonly energyGateway: EnergyGateway) {}

    @EventPattern(KafkaPattern.SyncEnergy)
    async syncEnergy(@Payload() payload: SyncEnergyPayload) {
        this.logger.log(`Event: ${KafkaPattern.SyncEnergy}`)
        this.energyGateway.syncEnergy(payload)
    }
}
