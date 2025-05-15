import { Injectable, Logger } from "@nestjs/common"
import {
    InjectMongoose,
    InventoryKind,
    InventorySchema,
    InventoryTypeId
} from "@src/databases"
import { UserLike } from "@src/jwt"
import { InventoryService, SyncService, StaticService } from "@src/gameplay"
import { Connection, ClientSession } from "mongoose"
import { createObjectId, WithStatus } from "@src/common"
import { SyncedResponse } from "../../types"
import { GraphQLError } from "graphql"

export interface SortInventoriesForSpecificKind {
    id: string
    kind: InventoryKind
    session: ClientSession
}

@Injectable()
export class SortInventoriesService {
    private readonly logger = new Logger(SortInventoriesService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly syncService: SyncService,
        private readonly staticService: StaticService,
        private readonly inventoryService: InventoryService
    ) {}

    //sort ensure that the quantity is not exceed the limit, so that the check is no need
    async sortInventories(
        {
            id: userId
        }: UserLike
    ): Promise<SyncedResponse> {
        const mongoSession = await this.connection.startSession()
        try {
            const result = await mongoSession.withTransaction(async (session) => {
                const storageResult = await this.sortInventoriesForSpecificKind({
                    id: userId,
                    kind: InventoryKind.Storage,
                    session
                })
                const deliveryResult = await this.sortInventoriesForSpecificKind({
                    id: userId,
                    kind: InventoryKind.Delivery,
                    session
                })
                return {
                    inventories: [...storageResult.inventories, ...deliveryResult.inventories]
                }
            })
            return result
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }

    async sortInventoriesForSpecificKind(
        {
            id: userId,
            kind,
            session
        }: SortInventoriesForSpecificKind
    ): Promise<SyncedResponse> {
        // synced variables
        const syncedInventories: Array<WithStatus<InventorySchema>> = []
        // Using `withTransaction` for automatic transaction handling
        const inventories = await this.connection.model<InventorySchema>(InventorySchema.name).find({
            user: userId,
            kind
        }).session(session)
        //sorting is a machemic to put the inventories in the correct order, which priority is
        const priorityInventoryTypeIds: Array<InventoryTypeId> = [
            // --- TOOLS ---
            InventoryTypeId.Crate,
            InventoryTypeId.WateringCan,
            InventoryTypeId.Hammer,
            InventoryTypeId.Herbicide,
            InventoryTypeId.Pesticide,
            InventoryTypeId.AnimalMedicine,
            InventoryTypeId.BugNet,
          
            // --- SEEDS ---
            // crops
            InventoryTypeId.TurnipSeed,
            InventoryTypeId.CarrotSeed,
            InventoryTypeId.PotatoSeed,
            InventoryTypeId.PineappleSeed,
            InventoryTypeId.WatermelonSeed,
            InventoryTypeId.CucumberSeed,
            InventoryTypeId.BellPepperSeed,
            InventoryTypeId.StrawberrySeed,

            // flowers
            InventoryTypeId.DaisySeed,
                    
            // --- HARVESTED ---
            // crops
            InventoryTypeId.Turnip,
            InventoryTypeId.TurnipQuality,

            InventoryTypeId.Carrot,
            InventoryTypeId.CarrotQuality,

            InventoryTypeId.Potato,
            InventoryTypeId.PotatoQuality,

            InventoryTypeId.Pineapple,
            InventoryTypeId.PineappleQuality,

            InventoryTypeId.Watermelon,
            InventoryTypeId.WatermelonQuality,

            InventoryTypeId.Cucumber,
            InventoryTypeId.CucumberQuality,

            InventoryTypeId.BellPepper,
            InventoryTypeId.BellPepperQuality,

            InventoryTypeId.Strawberry,
            InventoryTypeId.StrawberryQuality,
          
            // --- fruits ---
            InventoryTypeId.Apple,
            InventoryTypeId.AppleQuality,

            InventoryTypeId.Banana,
            InventoryTypeId.BananaQuality,

            InventoryTypeId.DragonFruit,
            InventoryTypeId.DragonFruitQuality,
                    
            InventoryTypeId.Jackfruit,
            InventoryTypeId.JackfruitQuality,

            InventoryTypeId.Rambutan,
            InventoryTypeId.RambutanQuality,

            InventoryTypeId.Pomegranate,
            InventoryTypeId.PomegranateQuality,
          
            // --- ANIMAL PRODUCTS & FEED ---
            InventoryTypeId.AnimalFeed,
            InventoryTypeId.Egg,
            InventoryTypeId.EggQuality,
            InventoryTypeId.Milk,
            InventoryTypeId.MilkQuality,
            InventoryTypeId.Honey,
            InventoryTypeId.HoneyQuality,
          
            // --- EVERYTHING ELSE (fertilizers, etc.) will default below ---
            InventoryTypeId.BasicFertilizer,
            InventoryTypeId.FruitFertilizer,
            InventoryTypeId.AnimalFeed,
        ]

        const priorityIndex = new Map<InventoryTypeId, number>()
        priorityInventoryTypeIds.forEach((typeId, idx) => {
            if (!priorityIndex.has(typeId)) {
                priorityIndex.set(typeId, idx)
            }
        })

        // 3) Now sort the master list from staticService
        const priorityInventoryTypes = this.staticService.inventoryTypes.slice()
            .sort((prev, next) => {
                const ia = priorityIndex.has(prev.displayId)
                    ? priorityIndex.get(prev.displayId)!
                    : priorityInventoryTypeIds.length
                const ib = priorityIndex.has(next.displayId)
                    ? priorityIndex.get(next.displayId)!
                    : priorityInventoryTypeIds.length
                return ia - ib
            })
        // thus, we try to design a sort algorithm that will sort the inventories based on the inventoryTypesPriorities array
        // first, we will try to merge the inventories that have the same type and put them into an map
        const inventoriesMap: Partial<Record<InventoryTypeId, Array<InventorySchema>>> = {}
                
        for (const inventory of inventories) {
            let hasThatType = false
            for (const inventoryType of priorityInventoryTypes) {
                if (inventory.inventoryType === createObjectId(inventoryType.id)) {
                    if (!inventoriesMap[inventoryType.id]) {
                        inventoriesMap[inventoryType.id] = []
                    }
                    inventoriesMap[inventoryType.id].push(inventory)
                    hasThatType = true
                }
            }
            if (!hasThatType) {
                throw new GraphQLError(`Inventory type ${inventory.inventoryType} not found in the inventoryTypesPriorities array`, {
                    extensions: {
                        code: "INVENTORY_TYPE_PRIORITY_NOT_FOUND",
                    }
                })
            }
        }

        let currentIndex = 0
        for (const inventoryType of Object.keys(inventoriesMap)) {
            const inventories = inventoriesMap[inventoryType]
            const { removedInventoryIds, updatedInventories } = this.inventoryService.mergeInventories({
                inventories,
                inventoryType: priorityInventoryTypes.find((type) => type.id === inventoryType)!
            })
            for (const { inventorySnapshot, inventoryUpdated } of updatedInventories) {
                inventoryUpdated.index = currentIndex
                currentIndex++
                // sync the inventories
                const updatedSyncedFoundInventory = this.syncService.getPartialUpdatedSyncedInventory({
                    inventorySnapshot,
                    inventoryUpdated
                })
                syncedInventories.push(updatedSyncedFoundInventory) 
                await inventoryUpdated.save({ session })
            }

            for (const inventoryId of removedInventoryIds) {
                const deletedSyncedInventory = this.syncService.getDeletedSyncedInventories({
                    inventoryIds: [inventoryId]
                })
                syncedInventories.push(...deletedSyncedInventory)
            }
            await this.connection.model<InventorySchema>(InventorySchema.name).deleteMany({
                _id: { $in: removedInventoryIds }
            }).session(session)
        }
        return {
            inventories: syncedInventories,
        }
    }
}
