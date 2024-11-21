import { Injectable, Logger } from "@nestjs/common"
import { PlacedItemEntity, UserEntity } from "@src/database"
import { DataSource } from "typeorm"
import {
    CreatePlacedItemRequest,
    CreatePlacedItemResponse,
    GetPlacedItemRequest,
    GetPlacedItemsRequest,
    UpdatePlacedItemRequest,
    UpdatePlacedItemResponse
} from "./placed-item.dto"
import { PlacedItemNotFoundException, UserNotFoundException } from "@src/exceptions"

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

    public async getPlacedItems(request: GetPlacedItemsRequest): Promise<Array<PlacedItemEntity>> {
        const placedItems = await this.dataSource.manager.find(PlacedItemEntity, {
            where: { id: request.userId }
        })
        return placedItems
    }

    public async createPlacedItem(
        request: CreatePlacedItemRequest
    ): Promise<CreatePlacedItemResponse> {
        const { id } = await this.dataSource.manager.save({
            ...request.placedItem,
            userId: request.userId
        })
        return {
            id
        }
    }

    public async updatePlacedItem(
        request: UpdatePlacedItemRequest
    ): Promise<UpdatePlacedItemResponse> {
        await this.dataSource.manager.update(PlacedItemEntity, request.id, request.placedItem)
        return {}
    }

    public async deletePlacedItem(
        request: GetPlacedItemRequest
    ): Promise<UpdatePlacedItemResponse> {
        await this.dataSource.manager.delete(PlacedItemEntity, request.id)
        return {}
    }

    private async findUserById(userId: string): Promise<UserEntity> {
        const user = await this.dataSource.manager.findOne(UserEntity, {
            where: { id: userId }
        })
        if (!user) throw new UserNotFoundException(userId)
        return user
    }
}
