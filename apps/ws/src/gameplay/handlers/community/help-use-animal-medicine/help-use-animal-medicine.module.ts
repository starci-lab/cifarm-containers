import { Module } from "@nestjs/common"
import { HelpUseAnimalMedicineGateway } from "./help-use-animal-medicine.gateway"
import { HelpUseAnimalMedicineService } from "./help-use-animal-medicine.service"

@Module({
    providers: [HelpUseAnimalMedicineService, HelpUseAnimalMedicineGateway],
})
export class HelpUseAnimalMedicineModule {} 