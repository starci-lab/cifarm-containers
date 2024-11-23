import { Injectable, Logger } from "@nestjs/common"
import { InventoryEntity, InventoryTypeEntity } from "@src/database"
import { DeepPartial } from "typeorm"
import { AddInventoryRequest, AddInventoryResponse } from "./inventory.dto"

@Injectable()
export class InventoryService {
    private readonly logger = new Logger(InventoryService.name)

    constructor() {}

    public addInventory(request: AddInventoryRequest): Promise<AddInventoryResponse> {
        let remainingQuantity = request.inventory.quantity
        const inventoryType = await manager.findOne(InventoryTypeEntity, {
            where: {
                id: request.inventory.inventoryType.id
            }
        })

        const inventories: DeepPartial<InventoryEntity>[] = await manager.find(InventoryEntity, {
            where: {
                user: {
                    id: request.userId
                },
                inventoryType: {
                    id: request.inventory.inventoryType.id
                }
            }
        })

        this.logger.debug(`Found ${inventories.length} inventories`)

        for (const inventory of inventories) {
            if (remainingQuantity <= 0) break

            const spaceInCurrentStack = inventoryType.maxStack - inventory.quantity
            if (spaceInCurrentStack > 0) {
                const quantityToAdd = Math.min(spaceInCurrentStack, remainingQuantity)
                inventory.quantity += quantityToAdd
                remainingQuantity -= quantityToAdd
            }
        }

        await manager.save(InventoryEntity, inventories)

        this.logger.debug(`Remaining quantity: ${remainingQuantity}`)

        if (remainingQuantity <= 0) return

        const inventoriesToCreate: DeepPartial<InventoryEntity>[] = []
        while (remainingQuantity > 0) {
            const newQuantity = Math.min(inventoryType.maxStack, remainingQuantity)
            inventoriesToCreate.push({
                ...request.inventory,
                user: {
                    id: request.userId
                },
                quantity: newQuantity
            })
            remainingQuantity -= newQuantity
        }

        await manager.save(InventoryEntity, inventoriesToCreate)

        return
    }
}
