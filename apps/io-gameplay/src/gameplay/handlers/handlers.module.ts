import { FarmingModule } from "./farming"
import { ShopModule } from "./shop"
import { Module } from "@nestjs/common"
@Module({
    imports: [
        FarmingModule,
        ShopModule
    ]
})
export class HandlersModule {}
