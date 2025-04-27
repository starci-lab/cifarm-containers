import { Inject, Injectable } from "@nestjs/common"
import { MODULE_OPTIONS_TOKEN } from "../gameplay.module-definition"
import { GameplayOptions } from "../gameplay.types"
import {
    InventoryMapData,
    PartitionInventoriesParams,
    PartitionInventoriesResult
} from "./ship.types"
import { StaticService } from "../static"
import { InjectMongoose, InventoryKind, InventorySchema, InventoryType } from "@src/databases"
import { Connection } from "mongoose"
import { GraphQLError } from "graphql"

@Injectable()
export class ShipService {
    constructor(
        @Inject(MODULE_OPTIONS_TOKEN)
        private readonly options: GameplayOptions,
        private readonly staticService: StaticService,
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    public async partitionInventories({
        userId,
        session
    }: PartitionInventoriesParams): Promise<PartitionInventoriesResult> {
        const wholesaleMarket = this.staticService.wholesaleMarket
        const productInventoryTypeIds = this.staticService.inventoryTypes.filter(
            (inventoryType) => inventoryType.type === InventoryType.Product
        ).map((inventoryType) => inventoryType.id)
        const inventories = await this.connection
            .model<InventorySchema>(InventorySchema.name)
            .find({
                user: userId,
                inventoryType: {
                    $in: productInventoryTypeIds
                },
                kind: InventoryKind.Storage
            })
            .session(session)
        const inventoryMap: Record<string, InventoryMapData> = {}
        for (const product of wholesaleMarket.products) {
            const inventoryMapData: InventoryMapData = {
                inventories: [],
                totalQuantity: 0,
                enough: false,
                requiredQuantity: product.quantity
            }
            // find the inventory of the product
            for (const inventory of inventories) {
                const inventoryType = this.staticService.inventoryTypes.find(
                    (inventoryType) => inventoryType.id === inventory.inventoryType.toString()
                )
                if (!inventoryType) {
                    throw new GraphQLError("Inventory type not found", {
                        extensions: {
                            code: "INVENTORY_TYPE_NOT_FOUND"
                        }
                    })
                }
                const foundProduct = this.staticService.products.find(
                    (product) => 
                        inventoryType.type === InventoryType.Product &&
                        inventoryType.product.toString() === product.id
                )
                if (!foundProduct) {
                    throw new GraphQLError("Product not found", {
                        extensions: {
                            code: "PRODUCT_NOT_FOUND"
                        }
                    })
                }
                if (foundProduct.id === product.productId.toString()) {
                    inventoryMapData.inventories.push(inventory)
                    inventoryMapData.totalQuantity += inventory.quantity
                }
            }
            if (inventoryMapData.totalQuantity >= product.quantity) {
                inventoryMapData.enough = true
            }
            inventoryMap[product.productId.toString()] = inventoryMapData
        }
        return {
            inventoryMap
        }
    }
}
