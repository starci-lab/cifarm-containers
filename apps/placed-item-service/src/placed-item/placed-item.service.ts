import { Injectable, Logger } from "@nestjs/common"
import { PlacedItemEntity } from "@src/database"
import { PlacedItemNotFoundException } from "@src/exceptions"
import { DataSource } from "typeorm"
import {
    CreatePlacedItemRequest,
    CreatePlacedItemResponse,
    GetPlacedItemRequest,
    GetPlacedItemsRequest,
    GetPlacedItemsResponse,
    UpdatePlacedItemRequest,
    UpdatePlacedItemResponse
} from "./placed-item.dto"

@Injectable()
export class PlacedItemService {
    private readonly logger: Logger = new Logger(PlacedItemService.name)
    constructor(private readonly dataSource: DataSource) {}

    public async getPlacedItem(request: GetPlacedItemRequest): Promise<PlacedItemEntity> {
        const placedItem = await this.dataSource.manager.findOne(PlacedItemEntity, {
            where: { id: request.id }
        })
        if (!placedItem) throw new PlacedItemNotFoundException(request.id)
        return placedItem
    }

    public async getPlacedItems(request: GetPlacedItemsRequest): Promise<GetPlacedItemsResponse> {
        const items = await this.dataSource.manager.find(PlacedItemEntity, {
            where: { id: request.userId }
        })
        return {
            items
        }
    }

    public async createPlacedItem(
        request: CreatePlacedItemRequest
    ): Promise<CreatePlacedItemResponse> {
        const { id } = await this.dataSource.manager.save({
            ...request.item,
            userId: request.userId
        })
        return {
            item: { id }
        }
    }

    public async updatePlacedItem(
        request: UpdatePlacedItemRequest
    ): Promise<UpdatePlacedItemResponse> {
        await this.dataSource.manager.update(PlacedItemEntity, request.id, request.item)
        return {}
    }

    public async deletePlacedItem(
        request: GetPlacedItemRequest
    ): Promise<UpdatePlacedItemResponse> {
        await this.dataSource.manager.delete(PlacedItemEntity, request.id)
        return {}
    }
}
