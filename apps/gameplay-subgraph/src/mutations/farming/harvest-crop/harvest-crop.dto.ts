import { IsInt, IsMongoId } from "class-validator"
import { Field, InputType, Int, ObjectType } from "@nestjs/graphql"

@InputType()
export class HarvestCropRequest {
    @IsMongoId()
    @Field(() => String, { description: "The ID of the placed item tile" })
        placedItemTileId: string
}

@ObjectType()
export class HarvestCropResponse {
    @IsInt()
    @Field(() => Int, { description: "The quantity of the harvested crop" })
        quantity: number
}
