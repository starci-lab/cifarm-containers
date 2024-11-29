import { Injectable, Logger, } from "@nestjs/common"
import { SeedGrowthInfoEntity } from "@src/database"
import { DataSource } from "typeorm"
import { GetSeedGrowthInfosArgs } from "./seed-growth-infos.dto"

@Injectable()
export class SeedGrowthInfosService {
    private readonly logger = new Logger(SeedGrowthInfosService.name)

    constructor(
        private readonly dataSource: DataSource,
    ) { }

    async getSeedGrowthInfos({ limit = 10, offset = 0 }: GetSeedGrowthInfosArgs): Promise<Array<SeedGrowthInfoEntity>> {
        this.logger.debug(`GetSeedGrowthInfos: limit=${limit}, offset=${offset}`)

        let seedGrowthInfos: Array<SeedGrowthInfoEntity>
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            seedGrowthInfos = await this.dataSource.getRepository(SeedGrowthInfoEntity).find({
                take: limit,
                skip: offset,
                relations: ["crop", "thiefedBy", "placedItem"]
            })
            return seedGrowthInfos
        } finally {
            await queryRunner.release()
        }
    }
}
