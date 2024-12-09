import { ApiProperty } from "@nestjs/swagger"
import { InventoryEntity } from "@src/database"
import { ArrayEntityWithUserIdParams, EntityParams } from "@src/types"
import { IsInt } from "class-validator"
import { DeepPartial } from "typeorm"

export class AddParams extends ArrayEntityWithUserIdParams<InventoryEntity> {}

export type AddResult = Array<DeepPartial<InventoryEntity>>

export class RemoveParams extends EntityParams<InventoryEntity> {
    @IsInt()
    @ApiProperty({ example: 1, description: "The quantity to remove" })
        quantity: number
}
export type RemoveResult = DeepPartial<InventoryEntity>