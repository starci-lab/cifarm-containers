import { Module } from "@nestjs/common"
import { GameplayModule } from "@src/gameplay"
import { RetainProductController } from "./retain-product.controller"
import { RetainProductService } from "./retain-product.service"

 
@Module({
    imports: [GameplayModule],
    providers: [RetainProductService],
    exports: [RetainProductService],
    controllers: [RetainProductController]
})
export class RetainProductModule {}
