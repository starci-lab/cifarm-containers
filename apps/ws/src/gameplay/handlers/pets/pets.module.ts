import { Module } from "@nestjs/common"
import { SelectCatModule } from "./select-cat"
import { SelectDogModule } from "./select-dog"

@Module({
    imports: [
        SelectCatModule,
        SelectDogModule
    ]
})
export class PetsModule {}