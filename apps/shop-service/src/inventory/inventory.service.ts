import { Injectable, Logger } from "@nestjs/common"
import { InventoryEntity } from "@src/database"
import { DataSource } from "typeorm"
import { AddInventoryRequest, AddInventoryResponse } from "./inventory.dto"

@Injectable()
export class InventoryService {
    private readonly logger: Logger = new Logger(InventoryService.name)
    constructor(private readonly dataSource: DataSource) {}

    public async addInventory(request: AddInventoryRequest): Promise<AddInventoryResponse> {
        const {
            userId,
            key,
            quantity,
            maxStack,
            type,
            placeable,
            isPlaced,
            premium,
            deliverable,
            asTool
        } = request

        let remainingQuantity = quantity
        const inventories = await this.dataSource.manager.find(InventoryEntity, {
            where: { referenceKey: key, userId }
        })

        for (const inventory of inventories) {
            if (remainingQuantity <= 0) break

            const spaceInCurrentStack = maxStack - inventory.quantity
            if (spaceInCurrentStack > 0) {
                const quantityToAdd = Math.min(spaceInCurrentStack, remainingQuantity)
                inventory.quantity += quantityToAdd
                remainingQuantity -= quantityToAdd
                await this.dataSource.manager.save(inventory)
            }
        }

        while (remainingQuantity > 0) {
            const newQuantity = Math.min(maxStack, remainingQuantity)
            const newInventory = this.dataSource.manager.create(InventoryEntity, {
                referenceKey: key,
                userId,
                quantity: newQuantity,
                type,
                placeable,
                isPlaced,
                premium,
                deliverable,
                asTool,
                maxStack
            })
            remainingQuantity -= newQuantity
            await this.dataSource.manager.save(newInventory)
        }

        return
    }
}
