import { Module } from "@nestjs/common"
import { PetsResolver } from "./pets.resolver"
import { PetsService } from "./pets.service"

@Module({
    providers: [PetsService, PetsResolver]
})
export class PetsModule {}
