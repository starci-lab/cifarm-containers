import { Module } from "@nestjs/common"
import { SelectDogGateway } from "./select-dog.gateway"
import { SelectDogService } from "./select-dog.service"

@Module({
    providers: [SelectDogGateway, SelectDogService],
    exports: [SelectDogService],
})
export class SelectDogModule {} 