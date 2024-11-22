import { InventoryEntity } from "@src/database"
import { ArrayResponse, Empty, UserIdRequest } from "@src/types"
import { DeepPartial } from "typeorm"

export class AddInventoryRequest extends UserIdRequest {
    inventory: DeepPartial<InventoryEntity>
}

export type AddInventoryResponse = Empty

export class GetInventoryRequest extends UserIdRequest {}

export class GetInventoryResponse extends ArrayResponse<InventoryEntity> {}
