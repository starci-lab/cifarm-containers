import { InventoryEntity } from "@src/database"
import { ArrayEntityRequest, Empty } from "@src/types"

export class AddInventoryRequest extends ArrayEntityRequest<InventoryEntity> {
    inventoryPartial: Pick<
        InventoryEntity,
        "quantity" | "tokenId" | "premium" | "isPlaced" | "inventoryType"
    >
}

export type AddInventoryResponse = Empty
