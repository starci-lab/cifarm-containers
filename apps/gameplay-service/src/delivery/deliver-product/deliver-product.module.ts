import { Global, Module } from "@nestjs/common"
import { DeliverProductController } from "./deliver-product.controller"
import { DeliverProductService } from "./deliver-product.service"
import { typeOrmForFeature } from "@src/dynamic-modules"

@Global()
@Module({
    imports: [
        typeOrmForFeature(),
    ],
    providers: [DeliverProductService],
    exports: [DeliverProductService],
    controllers: [DeliverProductController]
})
export class DeliverProductModule {}
