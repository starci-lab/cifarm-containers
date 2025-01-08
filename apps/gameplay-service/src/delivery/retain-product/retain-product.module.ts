import { Global, Module } from "@nestjs/common"
import { GameplayModule } from "@src/gameplay"
import { RetainProductController } from "./retain-product.controller"
import { RetainProductService } from "./retain-product.service"

@Global()
@Module({
    imports: [GameplayModule],
    providers: [RetainProductService],
    exports: [RetainProductService],
    controllers: [RetainProductController]
})
export class RetainProductModule {}
