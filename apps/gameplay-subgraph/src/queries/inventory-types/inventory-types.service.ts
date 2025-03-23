import { Injectable, Logger } from "@nestjs/common"
import { InventoryTypeId, InventoryTypeSchema } from "@src/databases"
import { StaticService } from "@src/gameplay"

@Injectable()
export class InventoryTypesService {
    private readonly logger = new Logger(InventoryTypesService.name)

    constructor(
        private readonly staticService: StaticService
    ) {}    

    inventoryTypes(): Array<InventoryTypeSchema> {
        return this.staticService.inventoryTypes
    }

    inventoryType(id: InventoryTypeId): InventoryTypeSchema {
        return this.staticService.inventoryTypes.find((inventoryType) => inventoryType.displayId === id)
    }
}
