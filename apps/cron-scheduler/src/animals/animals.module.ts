import { BullModule } from "@nestjs/bullmq"
import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type"
import * as Entities from "@src/database/gameplay-postgresql"
import { animalsTimeQueueConstants } from "../app.constant"
import { AnimalsService } from "./animals.service"

@Module({
    imports: [
        BullModule.registerQueue({
            name: animalsTimeQueueConstants.name
        }),
        TypeOrmModule.forFeature([...Object.values(Entities)]  as Array<EntityClassOrSchema>),
    ],
    providers: [AnimalsService]
})
export class AnimalsModule {}
