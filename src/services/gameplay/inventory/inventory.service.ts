import { Injectable, Logger } from "@nestjs/common"
import { InventoryEntity } from "@src/database"
import { DataSource, DeepPartial } from "typeorm"
import { AddInventoryRequest, AddInventoryResponse } from "./inventory.dto"

@Injectable()
export class InventoryService {
    private readonly logger = new Logger(InventoryService.name)

    constructor(
        private readonly dataSource: DataSource
    ) {}

    public async addInventory(request: AddInventoryRequest): Promise<AddInventoryResponse> {
        let remainingQuantity = request.inventory.quantity
        
        const inventories: DeepPartial<InventoryEntity>[] = await this.dataSource.manager.find(
            InventoryEntity,
            {
                where: { referenceKey: request.inventory.referenceKey, userId: request.userId }
            }
        )

        for (const inventory of inventories) {
            if (remainingQuantity <= 0) break

            const spaceInCurrentStack = request.inventory.maxStack - inventory.quantity
            if (spaceInCurrentStack > 0) {
                const quantityToAdd = Math.min(spaceInCurrentStack, remainingQuantity)
                inventory.quantity += quantityToAdd
                remainingQuantity -= quantityToAdd
            }
        }

        const inventoriesToCreate: Array<DeepPartial<InventoryEntity>> = []
        while (remainingQuantity > 0) {
            const newQuantity = Math.min(request.inventory.maxStack, remainingQuantity)
            inventoriesToCreate.push({
                ...request.inventory,
                userId: request.userId,
                quantity: newQuantity
            })
            remainingQuantity -= newQuantity
        }
        inventories.push(...inventoriesToCreate)

        await this.dataSource.manager.save(inventories)

        return {}
    }
}