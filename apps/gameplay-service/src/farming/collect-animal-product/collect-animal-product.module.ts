import { Module, Global } from "@nestjs/common"
import { CollectAnimalProductController } from "./collect-animal-product.controller"
import { CollectAnimalProductService } from "./collect-animal-product.service"
import { InventoryModule } from "@src/services"
import { typeOrmForFeature } from "@src/dynamic-modules"

@Global()
@Module({
    imports: [
        typeOrmForFeature(),
        InventoryModule,
    ],
    controllers: [CollectAnimalProductController],
    providers: [CollectAnimalProductService],
    exports: [CollectAnimalProductService],
})
export class CollectAnimalProductModule {}
