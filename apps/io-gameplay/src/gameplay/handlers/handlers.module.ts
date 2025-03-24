import { FarmingModule } from "./farming"
import { ShopModule } from "./shop"
import { Module } from "@nestjs/common"
import { CommunityModule } from "./community"

@Module({
    imports: [
        FarmingModule,
        ShopModule,
        CommunityModule
    ]
})
export class HandlersModule {}
