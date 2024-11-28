import { Injectable, Logger, Inject } from "@nestjs/common"
import { SpinEntity } from "@src/database"
import { DataSource } from "typeorm"
import { GetSpinsArgs } from "./spins.dto"
import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Cache } from "cache-manager"

@Injectable()
export class SpinsService {
    private readonly logger = new Logger(SpinsService.name)

    constructor(
        private readonly dataSource: DataSource,
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache
    ) { }

    async getSpins({ limit = 10, offset = 0 }: GetSpinsArgs): Promise<Array<SpinEntity>> {
        this.logger.debug(`GetSpins: limit=${limit}, offset=${offset}`)

        let spins: Array<SpinEntity>
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            spins = await this.dataSource.getRepository(SpinEntity).find({
                take: limit,
                skip: offset
            })
        } finally {
            await queryRunner.release()
        }
        return spins
    }
}
