import { Module } from "@nestjs/common"
import { PlacedItemsModule } from "./placed-items"
import { VisitModule } from "./visit"
import { AuthModule } from "@src/blockchain"
import { UserModule } from "./user"
import { HandlersModule } from "./handlers"

@Module({
    imports: [AuthModule, PlacedItemsModule, VisitModule, UserModule, HandlersModule]
})
export class Gameplay1Module {}
