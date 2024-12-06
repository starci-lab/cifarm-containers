import { Module } from "@nestjs/common"
import { AnimalsResolver } from "./animals.resolver"
import { AnimalsService } from "./animals.service"
import { typeOrmForFeature } from "@src/dynamic-modules"

@Module({
    imports: [typeOrmForFeature()],
    providers: [AnimalsService, AnimalsResolver]
})
export class AnimalsModule {}
