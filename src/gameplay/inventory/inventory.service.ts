import { Injectable, Logger } from "@nestjs/common"
import { InventoryKind, InventorySchema } from "@src/databases"
import { DeepPartial } from "@src/common"
import {
    AddParams,
    AddResult,
    GetAddParamsParams,
    GetAddParamsResult,
    GetUnoccupiedIndexesParams,
    InventoryUpdate,
    RemoveParams,
    RemoveResult,
    RemoveSingleParams,
    RemoveSingleResult
} from "./types"
import {
    InventoryCapacityExceededException,
} from "../exceptions"

@Injectable()
export class InventoryService {
    private readonly logger = new Logger(InventoryService.name)

    constructor() {}

    public add({
        inventories,
        inventoryType,
        quantity,
        capacity,
        userId,
        occupiedIndexes,
        kind = InventoryKind.Storage
    }: AddParams): AddResult {
        const updatedInventories: Array<InventoryUpdate> = []
        const createdInventories: Array<DeepPartial<InventorySchema>> = []

        // sort the quantity in ascending order
        const sortedInventories = inventories.sort((prev, next) => next.quantity - prev.quantity)

        // if inventory not stackable, create a new inventory for each quantity
        if (inventoryType.stackable === false) {
            // find the first available index
            let foundAvailableIndex = false
            for (let index = 0; index < capacity; index++) {
                if (!occupiedIndexes.includes(index)) {
                    createdInventories.push({
                        inventoryType: inventoryType.id,
                        user: userId,
                        index,
                        kind
                    })
                    occupiedIndexes.push(index)
                    foundAvailableIndex = true
                    break
                }
            }
            // if no available index is found, throw an exception
            if (!foundAvailableIndex) {
                throw new InventoryCapacityExceededException()
            }
            return { updatedInventories, createdInventories }
        }
        // loop through the inventories and add the quantity to the inventory
        for (const inventory of sortedInventories) {
            // clone the inventory
            const inventorySnapshot = inventory.$clone()
            // get the space in the current stack
            const spaceInCurrentStack = inventoryType.maxStack - inventory.quantity
            // if there is space in the current stack, add the quantity to the inventory
            if (spaceInCurrentStack > 0) {
                const quantityToAdd = Math.min(spaceInCurrentStack, quantity)
                inventory.quantity += quantityToAdd
                quantity -= quantityToAdd

                // push the updated inventory to the updated inventories array
                updatedInventories.push({
                    inventorySnapshot,
                    inventoryUpdated: inventory
                })
            }
        }

        // if quantity is still remaining, create a new inventory, and add the quantity to it
        while (quantity > 0) {
            const quantityToAdd = Math.min(inventoryType.maxStack, quantity)
            // find the first available index
            let foundAvailableIndex = false
            for (let index = 0; index < capacity; index++) {
                if (!occupiedIndexes.includes(index)) {
                    createdInventories.push({
                        quantity: quantityToAdd,
                        inventoryType: inventoryType.id,
                        user: userId,
                        index,
                        kind
                    })
                    occupiedIndexes.push(index)
                    foundAvailableIndex = true
                    break
                }
            }
            // if no available index is found, throw an exception
            if (!foundAvailableIndex) {
                throw new InventoryCapacityExceededException()
            }
            quantity -= quantityToAdd
        }

        return { updatedInventories, createdInventories }
    }

    public async getAddParams({
        connection,
        inventoryType,
        userId,
        session,
        kind = InventoryKind.Storage
    }: GetAddParamsParams): Promise<GetAddParamsResult> {
        const inventories = await connection
            .model<InventorySchema>(InventorySchema.name)
            .find({
                user: userId,
                inventoryType: inventoryType.id,
                kind
            })
            .session(session)

        const occupiedIndexes = await connection
            .model<InventorySchema>(InventorySchema.name)
            .distinct("index", {
                user: userId,
                kind
            })
            .session(session)

        return { inventories, occupiedIndexes }
    }


    public async getUnoccupiedIndexes({
        connection,
        userId,
        session,
        kind = InventoryKind.Storage,
        storageCapacity
    }: GetUnoccupiedIndexesParams): Promise<Array<number>> {
        const indexes = await connection
            .model<InventorySchema>(InventorySchema.name)
            .distinct("index", {
                user: userId,
                kind
            })
            .session(session)
        const unoccupiedIndexes: Array<number> = []
        for (let index = 0; index < storageCapacity; index++) {
            if (!indexes.includes(index)) {
                unoccupiedIndexes.push(index)
            }
        }
        return unoccupiedIndexes
    }

    public removeSingle({
        inventory,
        quantity
    }: RemoveSingleParams): RemoveSingleResult {
        const inventorySnapshot = inventory.$clone()
        inventory.quantity -= quantity
        if (inventory.quantity > 0) {
            return {
                updatedInventory: {
                    inventorySnapshot,
                    inventoryUpdated: inventory,
                },
            }
        }
        return {
            removedInventory: inventory,
            removeInsteadOfUpdate: true
        }
    }

    public remove({
        inventories,
        quantity,
        inventoryType,
    }: RemoveParams): RemoveResult {
        const updatedInventories: Array<InventoryUpdate> = []
        const removedInventoryIds: Array<string> = []

        // sort the quantity in ascending order
        const sortedInventories = inventories.sort((prev, next) => next.quantity - prev.quantity)
        // if inventory not stackable, create a new inventory for each quantity

        if (inventoryType.stackable === false) {
            //remove base on the quantity
            const removedInventoryIds = sortedInventories.slice(0, quantity).map((inventory) => inventory.id)
            return { removedInventoryIds, updatedInventories }
        }
        // loop through the inventories and add the quantity to the inventory
        for (const inventory of sortedInventories) {
            // clone the inventory
            const inventorySnapshot = inventory.$clone()
            if (quantity >= inventory.quantity) {
                removedInventoryIds.push(inventory.id)
                quantity -= inventory.quantity
            } else {
                inventory.quantity -= quantity
                updatedInventories.push({
                    inventorySnapshot,
                    inventoryUpdated: inventory
                })
                break
            }
        }
        return { removedInventoryIds, updatedInventories }
    }
}