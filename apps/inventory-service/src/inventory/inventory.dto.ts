import { Field } from "@nestjs/graphql"
import { InventoryEntity, InventoryType } from "@src/database"
import { Empty, UserIdRequest } from "@src/types"
import { IsBoolean, IsInt, IsPositive, IsUUID, Max, Min } from "class-validator"

export class AddInventoryRequest extends UserIdRequest {
    @IsUUID()
    key: string

    @IsInt()
    @IsPositive()
    quantity: number

    @IsInt()
    @Min(1)
    @Max(9999)
    maxStack: number

    type: InventoryType

    @IsBoolean()
    placeable: boolean

    @IsBoolean()
    isPlaced: boolean

    @IsBoolean()
    premium: boolean

    @IsBoolean()
    deliverable: boolean

    @IsBoolean()
    asTool: boolean
}

export type AddInventoryResponse = Empty

export class GetInventoryRequest extends UserIdRequest {}

export class GetInventoryResponse {
    @Field(() => [InventoryEntity])
    inventories: Array<InventoryEntity>
}
