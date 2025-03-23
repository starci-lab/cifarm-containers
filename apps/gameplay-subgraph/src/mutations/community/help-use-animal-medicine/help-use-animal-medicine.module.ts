import { Module } from "@nestjs/common"
import { HelpUseAnimalMedicineResolver } from "./help-use-animal-medicine.resolver"
import { HelpUseAnimalMedicineService } from "./help-use-animal-medicine.service"
 
@Module({
    providers: [HelpUseAnimalMedicineService, HelpUseAnimalMedicineResolver]
})
export class HelpUseAnimalMedicineModule {}
