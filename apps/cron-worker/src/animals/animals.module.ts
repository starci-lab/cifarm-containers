import { Module } from "@nestjs/common"
import { BullModule } from "@nestjs/bullmq"
import { animalsTimeQueueConstants } from "@apps/cron-scheduler"
import { AnimalsService } from "./animals.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import * as Entities from "@src/database/gameplay-postgresql"
import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type"

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
