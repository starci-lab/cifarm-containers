import { Module } from "@nestjs/common"
import { DecorationsService } from "./decorations.service"
import { DecorationsResolver } from "./decorations.resolver"

@Module({
    imports: [],
    providers: [DecorationsService, DecorationsResolver]
})
export class DecorationsModule {}
