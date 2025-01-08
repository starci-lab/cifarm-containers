import { Global, Module } from "@nestjs/common"
import { DeliverProductController } from "./deliver-product.controller"
import { DeliverProductService } from "./deliver-product.service"

@Global()
@Module({
    imports: [],
    providers: [DeliverProductService],
    exports: [DeliverProductService],
    controllers: [DeliverProductController]
})
export class DeliverProductModule {}
