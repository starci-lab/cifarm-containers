import { Injectable, Logger } from "@nestjs/common"
import { SeedGrowthInfoEntity } from "@src/database"
import { DataSource } from "typeorm"
import { GetSeedGrowthInfosArgs } from "./"

@Injectable()
export class SeedGrowthInfosService {
    private readonly logger = new Logger(SeedGrowthInfosService.name)

    constructor(private readonly dataSource: DataSource) {}

    async getSeedGrowthInfos({
        limit = 10,
        offset = 0
    }: GetSeedGrowthInfosArgs): Promise<Array<SeedGrowthInfoEntity>> {
        this.logger.debug(`GetSeedGrowthInfos: limit=${limit}, offset=${offset}`)

        let seedGrowthInfos: Array<SeedGrowthInfoEntity>
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            seedGrowthInfos = await queryRunner.manager.find(SeedGrowthInfoEntity, {
                take: limit,
                skip: offset,
                relations: {
                    crop: true,
                    thiefedBy: true,
                    placedItem: true,
                }
            })
            return seedGrowthInfos
        } finally {
            await queryRunner.release()
        }
    }
}
