import { Injectable, Logger } from "@nestjs/common"
import { InventorySchema } from "@src/databases"
import { DeepPartial } from "typeorm"
import { AddParams, AddResult, RemoveParams, RemoveResult } from "./inventory.types"
import { InventoryQuantityNotSufficientException } from "../exceptions"

@Injectable()
export class InventoryService {
    private readonly logger = new Logger(InventoryService.name)

    constructor() {}

    public add({ inventories, inventoryType, quantity }: AddParams): AddResult {
        const updatedInventories: Array<DeepPartial<InventorySchema>> = []
        const createdInventories: Array<DeepPartial<InventorySchema>> = []

        // sort the quantity in ascending order
        const sortedInventories = inventories.sort((prev, next) => next.quantity - prev.quantity)

        // loop through the inventories and add the quantity to the inventory
        for (const inventory of sortedInventories) {
            const spaceInCurrentStack = inventoryType.maxStack - inventory.quantity
            if (spaceInCurrentStack > 0) {
                const quantityToAdd = Math.min(spaceInCurrentStack, quantity)
                inventory.quantity += quantityToAdd
                quantity -= quantityToAdd   
            }
            updatedInventories.push(inventory)    
        }

        // if quantity is still remaining, create a new inventory, and add the quantity to it
        while (quantity > 0) {
            const quantityToAdd = Math.min(inventoryType.maxStack, quantity)
            createdInventories.push({ quantity: quantityToAdd, inventoryTypeKey: inventoryType.key })
            quantity -= quantityToAdd
        }

        return { updatedInventories, createdInventories }
    }

    public remove({ inventories, quantity }: RemoveParams) : RemoveResult {
        const updatedInventories: Array<DeepPartial<InventorySchema>> = []
        const removedInventories: Array<DeepPartial<InventorySchema>> = []

        // sort the inventories in ascending order
        const sortedInventories = inventories.sort((prev, next) => prev.quantity - next.quantity)

        // loop through the inventories and remove the quantity from the inventory
        for (const inventory of sortedInventories) {
            const quantityToRemove = Math.min(inventory.quantity, quantity)
            inventory.quantity -= quantityToRemove
            quantity -= quantityToRemove
            if (inventory.quantity > 0) {
                updatedInventories.push(inventory)
                break
            } else {
                removedInventories.push(inventory)
            }  
        }

        // if quantity is still remaining, throw an exception
        if (quantity > 0) {
            throw new InventoryQuantityNotSufficientException(quantity)
        }
        return { updatedInventories, removedInventories }
    }
}
