import { Injectable, Logger } from "@nestjs/common"
import { PlacedItemTypeId, PlacedItemTypeSchema } from "@src/databases"
import { StaticService } from "@src/gameplay"

@Injectable()
export class PlacedItemTypesService {
    private readonly logger = new Logger(PlacedItemTypesService.name)

    constructor(private readonly staticService: StaticService) {}

    placedItemTypes(): Array<PlacedItemTypeSchema> {
        return this.staticService.placedItemTypes
    }

    placedItemType(id: PlacedItemTypeId): PlacedItemTypeSchema {
        return this.staticService.placedItemTypes.find(
            (placedItemType) => placedItemType.displayId === id
        )
    }
}
