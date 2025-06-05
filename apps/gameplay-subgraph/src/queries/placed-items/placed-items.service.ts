import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, NFT_METADATA, PlacedItemSchema } from "@src/databases"
import { PlacedItemType } from "@src/databases"
import { UserLike } from "@src/jwt"
import { Connection } from "mongoose"
import {
    OccupiedPlacedItemCountsResponse,
    PlacedItemsRequest,
    StoredPlacedItemsRequest,
    StoredPlacedItemsResponse
} from "./placed-items.dto"
import { StaticService } from "@src/gameplay"

@Injectable()
export class PlacedItemsService {
    private readonly logger = new Logger(PlacedItemsService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly staticService: StaticService
    ) {}

    async placedItem(id: string): Promise<PlacedItemSchema> {
        try {
            return await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name).findById(id)
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }

    async placedItems(
        { id }: UserLike,
        { userId }: PlacedItemsRequest
    ): Promise<Array<PlacedItemSchema>> {
        try {
            // return the user id if not provided
            userId = userId || id
            return await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name).find({
                user: userId,
                isStored: {
                    $ne: true
                }
            }).populate(NFT_METADATA)
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }

    async storedPlacedItems(
        { id }: UserLike,
        { userId, limit, offset }: StoredPlacedItemsRequest
    ): Promise<StoredPlacedItemsResponse> {
        try {
            userId = userId || id
            const data = await this.connection
                .model<PlacedItemSchema>(PlacedItemSchema.name)
                .find({ user: userId, isStored: true })
                .skip(offset) // Pagination: skip the specified number of records
                .limit(limit) // Pagination: limit the number of records
                .populate(NFT_METADATA)
            const count = await this.connection
                .model<PlacedItemSchema>(PlacedItemSchema.name)
                .countDocuments({
                    user: userId,
                    isStored: true
                })
            return {
                data,
                count
            }
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }

    async occupiedPlacedItemCounts(
        { id }: UserLike
    ): Promise<OccupiedPlacedItemCountsResponse> {
        try {
            const fruitCount = await this.connection
                .model<PlacedItemSchema>(PlacedItemSchema.name)
                .countDocuments({
                    user: id,
                    placedItemType: {
                        $in: this.staticService.placedItemTypes
                            .filter((placedItemType) => placedItemType.type === PlacedItemType.Fruit)
                            .map((placedItemType) => placedItemType.id)
                    }
                })
            const buildingCount = await this.connection
                .model<PlacedItemSchema>(PlacedItemSchema.name)
                .countDocuments({
                    user: id,
                    placedItemType: {
                        $in: this.staticService.placedItemTypes
                            .filter((placedItemType) => placedItemType.type === PlacedItemType.Building)
                            .map((placedItemType) => placedItemType.id)
                    }
                })
            const tileCount = await this.connection
                .model<PlacedItemSchema>(PlacedItemSchema.name)
                .countDocuments({
                    user: id,
                    placedItemType: {
                        $in: this.staticService.placedItemTypes
                            .filter((placedItemType) => placedItemType.type === PlacedItemType.Tile)
                            .map((placedItemType) => placedItemType.id)
                    }
                })
            return {
                tileCount,
                fruitCount,
                buildingCount
            }
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }
}
