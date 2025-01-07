import { Global, Module } from "@nestjs/common"
import { DeliverProductController } from "./deliver-product.controller"
import { DeliverProductService } from "./deliver-product.service"
import { GameplayPostgreSQLModule } from "@src/databases"

@Global()
@Module({
    imports: [
        GameplayPostgreSQLModule.forFeature()
    ],
    providers: [DeliverProductService],
    exports: [DeliverProductService],
    controllers: [DeliverProductController]
})
export class DeliverProductModule {}
