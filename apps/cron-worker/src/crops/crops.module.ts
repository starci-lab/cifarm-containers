import { cropsTimeQueueConstants } from "@apps/cron-scheduler"
import { BullModule } from "@nestjs/bullmq"
import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type"
import { CropsWorker } from "./crops.service"
import * as Entities from "@src/database/gameplay-postgresql"

@Module({
    imports: [
        BullModule.registerQueue({
            name: cropsTimeQueueConstants.NAME
        }),
        TypeOrmModule.forFeature([...Object.values(Entities)]  as Array<EntityClassOrSchema>),
    ],
    providers: [CropsWorker]
})
export class CropsModule {}
