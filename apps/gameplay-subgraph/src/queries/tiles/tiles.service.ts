import { Injectable, Logger } from "@nestjs/common"
import { TileId, TileSchema } from "@src/databases"
import { StaticService } from "@src/gameplay"

@Injectable()
export class TilesService {
    private readonly logger = new Logger(TilesService.name)

    constructor(private readonly staticService: StaticService) {}

    tiles(): Array<TileSchema> {
        return this.staticService.tiles
    }

    tile(id: TileId): TileSchema {
        return this.staticService.tiles.find((tile) => tile.displayId === id)
    }
}
