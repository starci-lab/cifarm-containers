import { Injectable, Logger, OnModuleInit } from "@nestjs/common"
import { EnergyGateway } from "./energy.gateway"

@Injectable()
export class EnergyConsumer implements OnModuleInit {
    private readonly logger = new Logger(EnergyConsumer.name)

    constructor(private readonly energyGateway: EnergyGateway) {}
    
    async onModuleInit() {
        
    }

   
}
