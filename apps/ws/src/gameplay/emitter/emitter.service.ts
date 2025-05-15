import { Injectable } from "@nestjs/common"
import { PlacedItemsGateway } from "./placed-items"
import { UserGateway } from "./user"
import { InventoriesGateway } from "./inventories"   
import { ActionGateway } from "./actions"
import { SyncedResponse } from "../handlers/types"


@Injectable()
export class EmitterService {
    constructor(
        private readonly placedItemsGateway: PlacedItemsGateway,
        private readonly userGateway: UserGateway,
        private readonly inventoriesGateway: InventoriesGateway,
        private readonly actionGateway: ActionGateway
    ) {}

    public syncResponse<TData = undefined>(
        {
            userId,
            syncedResponse: {
                placedItems,
                user,
                inventories,
                action,
                watcherUserId   
            }
        }: SyncResponseParams<TData>) {
        if (placedItems) {  
            // take only the placed items that have an id
            placedItems = placedItems.filter((placedItem) => placedItem.id)
            this.placedItemsGateway.syncPlacedItems({
                data: placedItems,
                userId: watcherUserId || userId
            })
        }
        if (user) {
            // take only the user that has an id
            if (user.id) {
                this.userGateway.syncUser({
                    data: user,
                    userId
                })
            }
        }
        if (inventories) {
            // take only the inventories that have an id
            inventories = inventories.filter((inventory) => inventory.id)
            this.inventoriesGateway.syncInventories({
                data: inventories,
                userId
            })
        }
        if (action) {
            this.actionGateway.emitAction(action)
        }
    }
}

export interface SyncResponseParams<TData = undefined> {
    userId: string
    syncedResponse: SyncedResponse<TData>
}
