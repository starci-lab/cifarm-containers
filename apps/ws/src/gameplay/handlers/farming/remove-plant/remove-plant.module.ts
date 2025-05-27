import { Module } from "@nestjs/common"
import { RemovePlantService } from "./remove-plant.service"
import { RemovePlantGateway } from "./remove-plant.gateway"

@Module({
    providers: [RemovePlantService, RemovePlantGateway],
})
export class RemovePlantModule {} 