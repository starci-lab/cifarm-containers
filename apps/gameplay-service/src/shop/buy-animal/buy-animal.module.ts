import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type"
import * as Entities from "@src/database/gameplay-postgresql"
import { BuyAnimalController } from "./buy-animal.controller"
import { BuyAnimalService } from "./buy-animal.service"

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([...Object.values(Entities)]  as Array<EntityClassOrSchema>),
    ],
    controllers: [BuyAnimalController],
    providers: [BuyAnimalService],
    exports: [BuyAnimalService]
})
export class BuyAnimalModule {}
