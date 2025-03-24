import { Module } from "@nestjs/common"
import { UseAnimalMedicineService } from "./use-animal-medicine.service"
import { UseAnimalMedicineGateway } from "./use-animal-medicine.gateway"

@Module({
    providers: [UseAnimalMedicineService, UseAnimalMedicineGateway]
})
export class UseAnimalMedicineModule {} 