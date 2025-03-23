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
                action
            }
        }: SyncResponseParams<TData>) {
        if (placedItems) {  
            this.placedItemsGateway.syncPlacedItems({
                data: placedItems,
                userId
            })
        }
        if (user) {
            this.userGateway.syncUser({
                data: user,
                userId
            })
        }
        if (inventories) {
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
