import { GetTilesArgs } from "@apps/static-subgraph/src/tiles"
import { Injectable, Logger } from "@nestjs/common"
import { TileEntity } from "@src/database"
import { DataSource } from "typeorm"

@Injectable()
export class TilesService {
    private readonly logger = new Logger(TilesService.name)

    constructor(private readonly dataSource: DataSource) {}

    async getTiles({ limit = 10, offset = 0 }: GetTilesArgs): Promise<Array<TileEntity>> {
        this.logger.debug(`GetTiles: limit=${limit}, offset=${offset}`)
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const tiles = await this.dataSource.getRepository(TileEntity).find({
                take: limit,
                skip: offset
            })
            return tiles
        } finally {
            await queryRunner.release()
        }
    }
}
