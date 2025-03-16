// buy-supplies.dto.ts

import { Field, InputType } from "@nestjs/graphql"
import { Position } from "@src/gameplay"
import { Type } from "class-transformer"
import { IsMongoId, ValidateNested } from "class-validator"

@InputType()
export class MoveRequest {
    @IsMongoId()
    @Field(() => String, { description: "The ID of the placed item to move" })
        placedItemId: string

    @ValidateNested()
    @Type(() => Position)
    @Field(() => Position, { description: "The new position of the placed item" })
        position: Position
}

export class MoveResponse {
    // This class is intentionally left empty for future extensions
}