import { TempEntity, TempId } from "@src/databases"
import { DataSource } from "typeorm"
import { Seeder } from "typeorm-extension"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import { Logger } from "@nestjs/common"
dayjs.extend(utc)

export class TempSeeder implements Seeder {
    private readonly logger = new Logger(TempSeeder.name)
    track = true
    public async run(dataSource: DataSource): Promise<void> {
        this.logger.debug("Seeding temp...")
        await dataSource.manager.save(TempEntity, [
            {
                id: TempId.AnimalGrowthLastSchedule,
                value: {
                    date: dayjs().utc().toDate()
                }
            },
            {
                id: TempId.CropGrowthLastSchedule,
                value: {
                    date: dayjs().utc().toDate()
                }
            },
            {
                id: TempId.EnergyRegenerationLastSchedule,
                value: {
                    date: dayjs().utc().toDate()
                }
            }
        ])
        this.logger.verbose("Temp seeded successfully.")
    }
}
