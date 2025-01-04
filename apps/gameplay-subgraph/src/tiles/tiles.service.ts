import { Injectable, Logger } from "@nestjs/common"
import { DataSource } from "typeorm"
import { GetTilesArgs } from "./tiles.dto"
import { GameplayPostgreSQLService, TileEntity } from "@src/databases"

@Injectable()
export class TilesService {
    private readonly logger = new Logger(TilesService.name)

    private readonly dataSource: DataSource
        
    constructor(
        private readonly gameplayPostgreSqlService: GameplayPostgreSQLService,
    ) {
        this.dataSource = this.gameplayPostgreSqlService.getDataSource()
    }

    async getTiles({ limit = 10, offset = 0 }: GetTilesArgs): Promise<Array<TileEntity>> {
        this.logger.debug(`GetTiles: limit=${limit}, offset=${offset}`)
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const tiles = await queryRunner.manager.find(TileEntity, {
                take: limit,
                skip: offset,
            })
            return tiles
        } finally {
            await queryRunner.release()
        }
    }

    async getTile(id: string): Promise<TileEntity | null> {
        this.logger.debug(`GetTileById: id=${id}`)
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const tile = await queryRunner.manager.findOne(TileEntity, {
                where: { id },
            })
            return tile
        } finally {
            await queryRunner.release()
        }
    }
}
