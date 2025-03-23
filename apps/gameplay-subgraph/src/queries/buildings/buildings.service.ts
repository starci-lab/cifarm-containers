import { Injectable, Logger } from "@nestjs/common"
import { BuildingId, BuildingSchema } from "@src/databases"
import { StaticService } from "@src/gameplay/static"

@Injectable()
export class BuildingsService {
    private readonly logger = new Logger(BuildingsService.name)

    constructor(
        private readonly staticService: StaticService
    ) {}

    buildings(): Array<BuildingSchema> {
        return this.staticService.buildings
    }

    building(id: BuildingId): BuildingSchema {
        return this.staticService.buildings.find((building) => building.displayId === id)
    }
}
