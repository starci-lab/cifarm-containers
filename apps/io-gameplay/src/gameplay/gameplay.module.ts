import { Module } from "@nestjs/common"
import { PlacedItemsModule } from "./placed-items"
import { VisitModule } from "./visit"
import { AuthModule } from "@src/blockchain"
import { UserModule } from "./user"
import { ShopModule } from "./handlers"

@Module({
    imports: [AuthModule, PlacedItemsModule, VisitModule, UserModule, ShopModule]
})
export class Gameplay1Module {}
