import { Logger } from "@nestjs/common"
import {
    DailyRewardEntity,
    DailyRewardId,
} from "@src/databases"
import { DataSource } from "typeorm"
import { Seeder } from "typeorm-extension"

export class DailyRewardSeeder implements Seeder {
    private readonly logger = new Logger(DailyRewardSeeder.name)
    track = true
    public async run(dataSource: DataSource): Promise<void> {
        this.logger.debug("Seeding daily rewards...")
        await dataSource.manager.insert(DailyRewardEntity, [
            {
                id: DailyRewardId.Day1,
                golds: 100,
                day: 1,
                lastDay: false
            },
            {
                id: DailyRewardId.Day2,
                golds: 200,
                day: 2,
                lastDay: false
            },
            {
                id: DailyRewardId.Day3,
                golds: 300,
                day: 3,
                lastDay: false
            },
            {
                id: DailyRewardId.Day4,
                golds: 600,
                day: 4,
                lastDay: false
            },
            {
                id: DailyRewardId.Day5,
                day: 5,
                lastDay: true,
                golds: 1000,
                tokens: 0.25
            }
        ])
        this.logger.verbose("Daily rewards seeded successfully/")
    }
}
