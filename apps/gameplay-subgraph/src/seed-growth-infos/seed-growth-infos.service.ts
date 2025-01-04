import { Injectable, Logger } from "@nestjs/common"
import { GameplayPostgreSQLService, SeedGrowthInfoEntity } from "@src/databases"
import { DataSource } from "typeorm"
import { GetSeedGrowthInfosArgs } from "./"

@Injectable()
export class SeedGrowthInfosService {

    private readonly logger = new Logger(SeedGrowthInfosService.name)

    private readonly relations = {
        crop: true,
        thiefedBy: true,
        placedItem: true,
    }

    private readonly dataSource: DataSource
        
    constructor(
        private readonly gameplayPostgreSqlService: GameplayPostgreSQLService,
    ) {
        this.dataSource = this.gameplayPostgreSqlService.getDataSource()
    }

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
                relations: this.relations
            })
            return seedGrowthInfos
        } finally {
            await queryRunner.release()
        }
    }
    async getSeedGrowthInfoByID(id: string): Promise<SeedGrowthInfoEntity> {
        this.logger.debug(`GetSeedGrowthInfoByIds: id=${id}`)

        let seedGrowthInfo: SeedGrowthInfoEntity
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            seedGrowthInfo = await queryRunner.manager.findOne(SeedGrowthInfoEntity, {
                where: { id },
                relations:this.relations
            })
            return seedGrowthInfo
        } finally {
            await queryRunner.release()
        }
    }
}
