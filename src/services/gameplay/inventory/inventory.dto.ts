import { InventoryEntity } from "@src/database"
import { ArrayEntityWithUserIdRequest } from "@src/types"
import { DeepPartial } from "typeorm"

export class AddRequest extends ArrayEntityWithUserIdRequest<InventoryEntity> {}

export type AddResponse = Array<DeepPartial<InventoryEntity>>
