import { Global, Module } from "@nestjs/common"
import { RetainProductService } from "./retain-product.service"
import { RetainProductController } from "./retain-product.controller"
import { typeOrmForFeature } from "@src/dynamic-modules"

@Global()
@Module({
    imports: [
        typeOrmForFeature(),
    ],
    providers: [RetainProductService],
    exports: [RetainProductService],
    controllers: [RetainProductController]
})
export class RetainProductModule {}
