import { Injectable, Logger } from "@nestjs/common"
import { DataSource } from "typeorm"
import {
    BroadcastPlacedItemsRequest,
    BroadcastPlacedItemsResponse
} from "./broadcast-placed-items.dto"
import { PlacedItemEntity } from "@src/database"

@Injectable()
export class BroadcastPlacedItemsService {
    private readonly logger = new Logger(BroadcastPlacedItemsService.name)

    constructor(private readonly dataSource: DataSource) {}

    public async broadcastPlacedItems(
        request: BroadcastPlacedItemsRequest
    ): Promise<BroadcastPlacedItemsResponse> {
        this.logger.debug("Broadcast placed items request received")
        this.logger.debug(request)
        const placedItems = await this.dataSource.manager.find(PlacedItemEntity, {})
        this.logger.debug(`Found ${placedItems.length} placed items`)
        return {
            message: "ok"
        }
    }
}
