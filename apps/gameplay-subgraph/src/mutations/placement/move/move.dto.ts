// buy-supplies.dto.ts

import { Field, InputType } from "@nestjs/graphql"
import { PositionInput } from "@src/gameplay"
import { Type } from "class-transformer"
import { IsMongoId, ValidateNested } from "class-validator"

@InputType()
export class MoveRequest {
    @IsMongoId()
    @Field(() => String, { description: "The ID of the placed item to move" })
        placedItemId: string

    @ValidateNested()
    @Type(() => PositionInput)
    @Field(() => PositionInput, { description: "The new position of the placed item" })
        position: PositionInput
}