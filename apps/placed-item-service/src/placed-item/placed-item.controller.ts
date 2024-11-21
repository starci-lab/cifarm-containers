import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { placedItemGrpcConstants } from "../constants"
import { PlacedItemService } from "./placed-item.service"
import {
    CreatePlacedItemRequest,
    CreatePlacedItemResponse,
    GetPlacedItemRequest,
    GetPlacedItemsRequest,
    UpdatePlacedItemRequest,
    UpdatePlacedItemResponse
} from "./placed-item.dto"
import { PlacedItemEntity } from "@src/database"
@Controller()
export class PlacedItemController {
    private readonly logger = new Logger(PlacedItemController.name)

    constructor(private readonly placedItemService: PlacedItemService) {}

    @GrpcMethod(placedItemGrpcConstants.SERVICE, "GetPlacedItem")
    async getPlacedItem(request: GetPlacedItemRequest): Promise<PlacedItemEntity> {
        this.logger.debug(`Received getPlacedItem request for id: ${request.id}`)
        return this.placedItemService.getPlacedItem(request)
    }

    @GrpcMethod(placedItemGrpcConstants.SERVICE, "G")
    async getPlacedItems(request: GetPlacedItemsRequest): Promise<Array<PlacedItemEntity>> {
        this.logger.debug(`Received getPlacedItems request for userId: ${request.userId}`)
        return this.placedItemService.getPlacedItems(request)
    }

    @GrpcMethod(placedItemGrpcConstants.SERVICE, "CreatePlacedItem")
    async createPlacedItem(request: CreatePlacedItemRequest): Promise<CreatePlacedItemResponse> {
        this.logger.debug(
            `Received createPlacedItem request for userId: ${request.userId} with placedItem: ${request.placedItem}`
        )
        return this.placedItemService.createPlacedItem(request)
    }

    @GrpcMethod(placedItemGrpcConstants.SERVICE, "UpdatePlacedItem")
    async updatePlacedItem(request: UpdatePlacedItemRequest): Promise<UpdatePlacedItemResponse> {
        this.logger.debug(
            `Received updatePlacedItem request for id: ${request.id} with placedItem: ${request.placedItem}`
        )
        return this.placedItemService.updatePlacedItem(request)
    }

    @GrpcMethod(placedItemGrpcConstants.SERVICE, "DeletePlacedItem")
    async deletePlacedItem(request: GetPlacedItemRequest): Promise<UpdatePlacedItemResponse> {
        this.logger.debug(`Received deletePlacedItem request for id: ${request.id}`)
        return this.placedItemService.deletePlacedItem(request)
    }
}
