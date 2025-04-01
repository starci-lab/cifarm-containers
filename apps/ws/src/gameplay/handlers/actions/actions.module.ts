import { Module } from "@nestjs/common"
import { VisitModule } from "./visit"
import { ReturnModule } from "./return"

@Module({
    imports: [VisitModule, ReturnModule]
})

export class ActionsModule {}
