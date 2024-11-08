import { Injectable, Logger } from "@nestjs/common"
import { TileEntity } from "@src/database"
import { DataSource } from "typeorm"
import { GetTilesArgs } from "./tiles.dto"

@Injectable()
export class TilesService {
    private readonly logger = new Logger(TilesService.name)

    constructor(private readonly dataSource: DataSource) {}
    
    async getTiles({
        limit = 10,
        offset = 0,
    }: GetTilesArgs): Promise<Array<TileEntity>> {
        this.logger.debug(`GetTiles: limit=${limit}, offset=${offset}`)
        return this.dataSource.manager.find(TileEntity, {
            take: limit,
            skip: offset,
        })
    }
}
