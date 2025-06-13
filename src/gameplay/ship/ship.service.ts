import { Inject, Injectable } from "@nestjs/common"
import { MODULE_OPTIONS_TOKEN } from "../gameplay.module-definition"
import { GameplayOptions } from "../types"
import {
    InventoryMapData,
    PartitionInventoriesParams,
    PartitionInventoriesResult
} from "./types"
import { StaticService } from "../static"
import { InjectMongoose, InventoryKind, InventorySchema, InventoryType } from "@src/databases"
import { Connection } from "mongoose"
import { BulkNotFoundException, ProductNotFoundException, SeasonNotFoundException } from "../exceptions"

@Injectable()
export class ShipService {
    constructor(
        @Inject(MODULE_OPTIONS_TOKEN)
        private readonly options: GameplayOptions,
        private readonly staticService: StaticService,
        @InjectMongoose()
        private readonly connection: Connection
    ) { }

    public async partitionInventories({
        userId,
        session,
        bulkId
    }: PartitionInventoriesParams): Promise<PartitionInventoriesResult> {
        const activeSeason = this.staticService.seasons.find(season => season.active)
        if (!activeSeason) {
            throw new SeasonNotFoundException()
        }
        const productInventoryTypeIds = this.staticService.inventoryTypes
            .filter(type => type.type === InventoryType.Product)
            .map(type => type.id)
    
        const inventories = await this.connection
            .model<InventorySchema>(InventorySchema.name)
            .find({
                user: userId,
                inventoryType: { $in: productInventoryTypeIds },
                kind: InventoryKind.Storage
            })
            .session(session)
    
        const bulk = activeSeason.bulks.find(bulk => bulk.id === bulkId)
        if (!bulk) {
            throw new BulkNotFoundException()
        }
    
        // create map to quickly search
        const inventoryTypeMap = new Map(
            this.staticService.inventoryTypes.map(type => [type.id.toString(), type])
        )
        const productMap = new Map(
            this.staticService.products.map(product => [product.id.toString(), product])
        )
    
        // prepare inventoryMap for each productId
        const inventoryMap: Record<string, InventoryMapData> = {}
    
        for (const product of bulk.products) {
            inventoryMap[product.productId.toString()] = {
                inventories: [],
                totalQuantity: 0,
                enough: false,
                requiredQuantity: product.quantity
            }
        }
    
        for (const inventory of inventories) {
            const inventoryType = inventoryTypeMap.get(inventory.inventoryType.toString())
            if (!inventoryType || inventoryType.type !== InventoryType.Product) {
                continue
            }
    
            const product = productMap.get(inventoryType.product?.toString())
            if (!product) {
                throw new ProductNotFoundException()
            }
    
            const productId = product.id.toString()
            const mapData = inventoryMap[productId]
            if (mapData) {
                mapData.inventories.push(inventory)
                mapData.totalQuantity += inventory.quantity
            }
        }
    
        // check if the inventory is enough
        for (const productId in inventoryMap) {
            const mapData = inventoryMap[productId]
            mapData.enough = mapData.totalQuantity >= mapData.requiredQuantity
        }
    
        return {
            inventoryMap
        }
    }   
}
