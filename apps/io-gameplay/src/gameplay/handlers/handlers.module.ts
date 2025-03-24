import { FarmingModule } from "./farming"
import { ShopModule } from "./shop"
import { Module } from "@nestjs/common"
import { CommunityModule } from "./community"
import { InventoriesModule } from "./inventories"
import { ClaimModule } from "./claim"
import { ActionsModule } from "./actions"
@Module({
    imports: [
        FarmingModule,
        ShopModule,
        CommunityModule,
        InventoriesModule,
        ClaimModule,
        ActionsModule
    ]
})
export class HandlersModule {}
