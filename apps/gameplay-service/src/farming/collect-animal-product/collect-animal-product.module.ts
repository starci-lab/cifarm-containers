import { Module, Global } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { CollectAnimalProductController } from "./collect-animal-product.controller"
import { CollectAnimalProductService } from "./collect-animal-product.service"
import * as Entities from "@src/database"
import { InventoryModule } from "@src/services"
import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type"

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([...Object.values(Entities)] as Array<EntityClassOrSchema>),
        InventoryModule,
    ],
    controllers: [CollectAnimalProductController],
    providers: [CollectAnimalProductService],
    exports: [CollectAnimalProductService],
})
export class CollectAnimalProductModule {}
