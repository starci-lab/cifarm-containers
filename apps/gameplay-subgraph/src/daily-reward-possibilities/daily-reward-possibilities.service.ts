import { Injectable, Logger } from "@nestjs/common"
import { DataSource } from "typeorm"

@Injectable()
export class DailyRewardPossibilitiesService {
    private readonly logger = new Logger(DailyRewardPossibilitiesService.name)

    constructor(private readonly dataSource: DataSource) {}

    // async getDailyRewardPossibilities({
    //     limit = 10,
    //     offset = 0
    // }: GetDailyRewardPossibilitiesArgs): Promise<Array<DailyRewardPossibilityEntity>> {
    //     this.logger.debug(`GetDailyRewardPossibilities: limit=${limit}, offset=${offset}`)

    //     let dailyRewards: Array<DailyRewardPossibilityEntity>
    //     const queryRunner = this.dataSource.createQueryRunner()
    //     await queryRunner.connect()
    //     try {
    //         dailyRewards = await queryRunner.manager.find(DailyRewardPossibilityEntity, {
    //             take: limit,
    //             skip: offset,
    //             relations: {
    //                 dailyReward: true,
    //             }
    //         })
    //         return dailyRewards
    //     } finally {
    //         await queryRunner.release()
    //     }
    // }
}
