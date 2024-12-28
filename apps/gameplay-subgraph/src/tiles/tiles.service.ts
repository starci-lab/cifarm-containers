import { Injectable, Logger } from "@nestjs/common"
import { DataSource } from "typeorm"
import { GetTilesArgs } from "./"
import { TileEntity } from "@src/databases"

@Injectable()
export class TilesService {
    private readonly logger = new Logger(TilesService.name)

    private readonly relations = {
        // Add relations here as needed
    }

    constructor(private readonly dataSource: DataSource) {}

    async getTiles({ limit = 10, offset = 0 }: GetTilesArgs): Promise<Array<TileEntity>> {
        this.logger.debug(`GetTiles: limit=${limit}, offset=${offset}`)
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const tiles = await queryRunner.manager.find(TileEntity, {
                take: limit,
                skip: offset,
                relations: this.relations
            })
            return tiles
        } finally {
            await queryRunner.release()
        }
    }

    async getTileById(id: string): Promise<TileEntity | null> {
        this.logger.debug(`GetTileById: id=${id}`)
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const tile = await queryRunner.manager.findOne(TileEntity, {
                where: { id },
                relations: this.relations
            })
            return tile
        } finally {
            await queryRunner.release()
        }
    }
}
