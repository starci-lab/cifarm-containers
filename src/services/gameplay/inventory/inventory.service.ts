import { Injectable, Logger } from "@nestjs/common"
import { InventoryEntity } from "@src/database"
import { DeepPartial } from "typeorm"
import { AddParams, AddResult, RemoveParams, RemoveResult } from "./inventory.dto"
import { InventoryQuantityNotSufficientException } from "@src/exceptions"

@Injectable()
export class InventoryService {
    private readonly logger = new Logger(InventoryService.name)

    constructor() {}

    public add(params: AddParams): AddResult {
        const resultInventories: Array<DeepPartial<InventoryEntity>> = params.entities

        let remainingQuantity = params.data.quantity

        const inventoryType = params.data.inventoryType

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
                    id: params.userId
                }
            })
            remainingQuantity -= newQuantity
        }

        return resultInventories
    }

    public remove(params: RemoveParams) : RemoveResult {
        const { entity, quantity } = params

        this.logger.debug(`Removing ${quantity} from inventory ${entity.id}`)

        if (entity.quantity < quantity)
            throw new InventoryQuantityNotSufficientException(entity.id, params.quantity)

        return { quantity: entity.quantity - quantity }
    }
}
