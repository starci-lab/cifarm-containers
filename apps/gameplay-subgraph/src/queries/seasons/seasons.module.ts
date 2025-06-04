import { Module } from "@nestjs/common"
import { SeasonsService } from "./seasons.service"
import { SeasonsResolver } from "./seasons.resolver"
 
@Module({
    providers: [SeasonsService, SeasonsResolver]
})
export class SeasonsModule { }
