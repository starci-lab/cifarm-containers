import { Module } from "@nestjs/common"
import { ThiefAnimalGateway } from "./thief-animal.gateway"
import { ThiefAnimalService } from "./thief-animal.service"

@Module({
    providers: [ThiefAnimalService, ThiefAnimalGateway],
})
export class ThiefAnimalModule {} 