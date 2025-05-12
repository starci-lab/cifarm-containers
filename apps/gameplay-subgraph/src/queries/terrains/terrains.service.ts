import { Injectable, Logger } from "@nestjs/common"
import { TerrainId, TerrainSchema } from "@src/databases"
import { StaticService } from "@src/gameplay/static"

@Injectable()
export class TerrainsService {
    private readonly logger = new Logger(TerrainsService.name)

    constructor(
        private readonly staticService: StaticService
    ) {}

    terrains(): Array<TerrainSchema> {
        return this.staticService.terrains
    }

    terrain(id: TerrainId): TerrainSchema {
        return this.staticService.terrains.find((terrain) => terrain.displayId === id)
    }
}
