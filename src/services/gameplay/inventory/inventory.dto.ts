import { InventoryEntity } from "@src/database"
import { ArrayEntityRequest, Empty } from "@src/types"
import { DeepPartial } from "typeorm"

export class AddInventoryRequest extends ArrayEntityRequest<InventoryEntity> {
    newInventory: DeepPartial<InventoryEntity>
}

export type AddInventoryResponse = Empty
