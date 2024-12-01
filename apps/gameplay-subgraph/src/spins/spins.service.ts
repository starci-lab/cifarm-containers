import { Injectable, Logger, Inject } from "@nestjs/common"
import { SpinSlotEntity } from "@src/database"
import { DataSource } from "typeorm"
import { GetSpinsArgs } from "./"
import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Cache } from "cache-manager"

@Injectable()
export class SpinsService {
    private readonly logger = new Logger(SpinsService.name)

    constructor(
        private readonly dataSource: DataSource,
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache
    ) {}

    async getSpins({ limit = 10, offset = 0 }: GetSpinsArgs): Promise<Array<SpinSlotEntity>> {
        this.logger.debug(`GetSpinSlots: limit=${limit}, offset=${offset}`)

        let spins: Array<SpinSlotEntity>
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            spins = await queryRunner.manager.find(SpinSlotEntity,{
                take: limit,
                skip: offset,
                relations: {
                    spinPrize: true,
                }
            })
        } finally {
            await queryRunner.release()
        }
        return spins
    }
}
