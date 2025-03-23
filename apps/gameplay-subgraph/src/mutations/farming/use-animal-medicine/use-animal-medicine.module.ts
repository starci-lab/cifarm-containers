import { Module } from "@nestjs/common"
import { UseAnimalMedicineResolver } from "./use-animal-medicine.resolver"
import { UseAnimalMedicineService } from "./use-animal-medicine.service"

 
@Module({
    providers: [UseAnimalMedicineService, UseAnimalMedicineResolver]
})
export class UseAnimalMedicineModule {}
