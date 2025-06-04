import { Injectable, Logger } from "@nestjs/common"
import { SeasonSchema, SeasonId } from "@src/databases"
import { StaticService } from "@src/gameplay"

@Injectable()
export class SeasonsService {
    private readonly logger = new Logger(SeasonsService.name)

    constructor(
        private readonly staticService: StaticService
    ) { }

    seasons(): Array<SeasonSchema> {
        return this.staticService.seasons
    }

    season(id: SeasonId): SeasonSchema {
        return this.staticService.seasons.find((season) => season.displayId === id)
    }

    activeSeason(): SeasonSchema {
        return this.staticService.seasons.find((season) => season.active)
    }
}
