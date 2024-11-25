import { InventoryEntity } from "@src/database"
import { ArrayEntityWithUserIdRequest } from "@src/types"
import { DeepPartial } from "typeorm"

export class AddInventoryRequest extends ArrayEntityWithUserIdRequest<InventoryEntity> {}

export type AddInventoryResponse = Array<DeepPartial<InventoryEntity>>
