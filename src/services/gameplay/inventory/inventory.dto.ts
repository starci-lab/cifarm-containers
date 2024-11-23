import { InventoryEntity } from "@src/database"
import { ArrayEntityWithUserIdRequest } from "@src/types"
import { DeepPartial } from "typeorm"

export class AddInventoryRequest extends ArrayEntityWithUserIdRequest<InventoryEntity> {
    inventoryPartial: Pick<
        InventoryEntity,
        "quantity" | "tokenId" | "premium" | "isPlaced" | "inventoryType"
    >
}

export type AddInventoryResponse = Array<DeepPartial<InventoryEntity>>
