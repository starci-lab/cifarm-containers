import { Module } from "@nestjs/common"
import { SelectCatGateway } from "./select-cat.gateway"
import { SelectCatService } from "./select-cat.service"

@Module({
    providers: [SelectCatGateway, SelectCatService],
    exports: [SelectCatService],
})
export class SelectCatModule {} 