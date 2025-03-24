import { FarmingModule } from "./farming"
import { ShopModule } from "./shop"
import { Module } from "@nestjs/common"
import { CommunityModule } from "./community"
import { DeliveryModule } from "./delivery"

@Module({
    imports: [
        FarmingModule,
        ShopModule,
        CommunityModule,
        DeliveryModule
    ]
})
export class HandlersModule {}
