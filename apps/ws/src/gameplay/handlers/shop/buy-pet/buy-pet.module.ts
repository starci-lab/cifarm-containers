import { Module } from "@nestjs/common"
import { BuyPetService } from "./buy-pet.service"
import { BuyPetGateway } from "./buy-pet.gateway"

@Module({
    providers: [BuyPetService, BuyPetGateway]
})
export class BuyPetModule {}
