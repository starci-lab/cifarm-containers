import { Injectable, Logger, Inject } from "@nestjs/common"
import { DataSource } from "typeorm"
import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Cache } from "cache-manager"

@Injectable()
export class SeedGrowthInfoThiefedByUsersService {
    private readonly logger = new Logger(SeedGrowthInfoThiefedByUsersService.name)

    constructor(
        private readonly dataSource: DataSource,
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache
    ) {}

    // async getSeedGrowthInfoThiefedByUsers({ limit = 10, offset = 0 }: GetSeedGrowthInfoThiefedByUsersArgs): Promise<Array<SeedGrowthInfoThiefedByUserEntity>> {
    //     this.logger.debug(`GetSeedGrowthInfoThiefedByUsers: limit=${limit}, offset=${offset}`)

    //     let spins: Array<SeedGrowthInfoThiefedByUserEntity>
    //     const queryRunner = this.dataSource.createQueryRunner()
    //     await queryRunner.connect()
    //     try {
    //         spins = await this.dataSource.getRepository(SeedGrowthInfoThiefedByUserEntity).find({
    //             take: limit,
    //             skip: offset
    //         })
    //     } finally {
    //         await queryRunner.release()
    //     }
    //     return spins
    // }
}
