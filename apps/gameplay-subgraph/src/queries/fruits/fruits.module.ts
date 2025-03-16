import { Module } from "@nestjs/common"
import { FruitsResolver } from "./fruits.resolver"
import { FruitsService } from "./fruits.service"

@Module({
    imports: [],
    providers: [FruitsService, FruitsResolver]
})
export class FruitsModule {}
