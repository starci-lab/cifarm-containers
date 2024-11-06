import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { broadcastGrpcConstants } from "./constants"
import {
    BroadcastPlacedItemsRequest,
    BroadcastPlacedItemsResponse,
    BroadcastPlacedItemsService,
} from "./broadcast-placed-items"

@Controller()
export class AppController {
    private readonly logger = new Logger(AppController.name)

    constructor(
    private readonly broadcastPlacedItemsService: BroadcastPlacedItemsService,
    ) {}

  @GrpcMethod(broadcastGrpcConstants.SERVICE, "BroadcastPlacedItems")
    public async broadcastPlacedItems(
        request: BroadcastPlacedItemsRequest,
    ): Promise<BroadcastPlacedItemsResponse> {
        this.logger.debug("BroadcastPlacedItems called")
        return await this.broadcastPlacedItemsService.broadcastPlacedItems(request)
    }
}
