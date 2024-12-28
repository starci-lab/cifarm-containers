import { Module, Global } from "@nestjs/common"
import { CollectAnimalProductController } from "./collect-animal-product.controller"
import { CollectAnimalProductService } from "./collect-animal-product.service"
import { InventoryModule } from "@src/services"
import { GameplayPostgreSQLModule } from "@src/databases"

@Global()
@Module({
    imports: [
        GameplayPostgreSQLModule.forRoot(),
        InventoryModule,
    ],
    controllers: [CollectAnimalProductController],
    providers: [CollectAnimalProductService],
    exports: [CollectAnimalProductService],
})
export class CollectAnimalProductModule {}
