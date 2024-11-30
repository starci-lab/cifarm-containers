import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type"
import * as Entities from "@src/database/gameplay-postgresql"
import { DeliverProductController } from "./deliver-product.controller"
import { DeliverProductService } from "./deliver-product.service"

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([...Object.values(Entities)]  as Array<EntityClassOrSchema>),
    ],
    providers: [DeliverProductService],
    exports: [DeliverProductService],
    controllers: [DeliverProductController]
})
export class DeliverProductModule {}
