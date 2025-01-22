import { KeyValueStoreEntity, KeyValueStoreId } from "@src/databases"
import { DataSource } from "typeorm"
import { Seeder } from "typeorm-extension"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import { Logger } from "@nestjs/common"
dayjs.extend(utc)

export class KeyValueStoreSeeder implements Seeder {
    private readonly logger = new Logger(KeyValueStoreSeeder.name)
    track = true
    public async run(dataSource: DataSource): Promise<void> {
        this.logger.debug("Seeding temp...")
        await dataSource.manager.save(KeyValueStoreEntity, [
            {
                id: KeyValueStoreId.AnimalGrowthLastSchedule,
                value: {
                    date: dayjs().utc().toDate()
                }
            },
            {
                id: KeyValueStoreId.CropGrowthLastSchedule,
                value: {
                    date: dayjs().utc().toDate()
                }
            },
            {
                id: KeyValueStoreId.EnergyRegenerationLastSchedule,
                value: {
                    date: dayjs().utc().toDate()
                }
            }
        ])
        this.logger.verbose("Temp seeded successfully.")
    }
}
