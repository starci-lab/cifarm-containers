import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { RetainProductService } from "./retain-product.service"
import { RetainProductController } from "./retain-product.controller"
import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type"
import * as Entities from "@src/database/gameplay-postgresql"

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([...Object.values(Entities)]  as Array<EntityClassOrSchema>),
    ],
    providers: [RetainProductService],
    exports: [RetainProductService],
    controllers: [RetainProductController]
})
export class RetainProductModule {}
