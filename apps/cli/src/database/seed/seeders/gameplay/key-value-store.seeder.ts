import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import { Injectable, Logger } from "@nestjs/common"
import { Seeder } from "nestjs-seeder"
import { InjectMongoose, KeyValueStoreId, KeyValueStoreSchema } from "@src/databases"
import { createObjectId, DeepPartial } from "@src/common"
import { Connection } from "mongoose"
dayjs.extend(utc)

@Injectable()
export class KeyValueStoreSeeder implements Seeder {
    private readonly logger = new Logger(KeyValueStoreSeeder.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    public async seed(): Promise<void> {
        this.logger.debug("Seeding key value store...")
        const data: Array<DeepPartial<KeyValueStoreSchema>> = [
            {
                _id: createObjectId(KeyValueStoreId.CropGrowthLastSchedule),
                displayId: KeyValueStoreId.CropGrowthLastSchedule,
                value: {
                    date: dayjs().utc().toDate()
                }
            },
            {
                _id: createObjectId(KeyValueStoreId.EnergyRegenerationLastSchedule),
                displayId: KeyValueStoreId.EnergyRegenerationLastSchedule,
                value: {
                    date: dayjs().utc().toDate()
                }
            },
            {
                _id: createObjectId(KeyValueStoreId.AnimalGrowthLastSchedule),
                displayId: KeyValueStoreId.AnimalGrowthLastSchedule,
                value: {
                    date: dayjs().utc().toDate()
                }
            }
        ]
        await this.connection.model<KeyValueStoreSchema>(KeyValueStoreSchema.name).insertMany(data)
    }

    public async drop(): Promise<void> {
        await this.connection.model(KeyValueStoreSchema.name).deleteMany({})
    }
}
