import { Injectable, Logger } from "@nestjs/common"
import { InventoryEntity, InventoryTypeEntity } from "@src/database"
import { DeepPartial } from "typeorm"
import { AddInventoryRequest, AddInventoryResponse } from "./inventory.dto"

@Injectable()
export class InventoryService {
    private readonly logger = new Logger(InventoryService.name)

    constructor() {}

    public add(request: AddInventoryRequest): AddInventoryResponse {
        const resultInventories: Array<DeepPartial<InventoryEntity>> = request.entities

        let remainingQuantity = request.data.quantity

        const inventoryType =
            (request.data.inventoryType as InventoryTypeEntity) ||
            (request.entities[0].inventoryType as InventoryTypeEntity)

        this.logger.debug(`Found ${resultInventories.length} inventories`)

        for (const inventory of resultInventories) {
            if (remainingQuantity <= 0) break

            const spaceInCurrentStack = inventoryType.maxStack - inventory.quantity
            if (spaceInCurrentStack > 0) {
                const quantityToAdd = Math.min(spaceInCurrentStack, remainingQuantity)
                inventory.quantity += quantityToAdd
                remainingQuantity -= quantityToAdd
            }
        }

        this.logger.debug(`Remaining quantity: ${remainingQuantity}`)

        while (remainingQuantity > 0) {
            const newQuantity = Math.min(inventoryType.maxStack, remainingQuantity)
            resultInventories.push({
                inventoryType: {
                    id: inventoryType.id
                },
                quantity: newQuantity,
                user: {
                    id: request.userId
                }
            })
            remainingQuantity -= newQuantity
        }

        return resultInventories
    }
}
