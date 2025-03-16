import { IsInt, IsMongoId } from "class-validator"
import { InputType, Field, ObjectType } from "@nestjs/graphql"

@InputType()
export class ThiefCropRequest {
    @IsMongoId()
    @Field(() => String, { description: "The ID of the tile to steal crop from" })
        placedItemTileId: string
}

@ObjectType()
export class ThiefCropResponse {
    @IsInt()
    @Field(() => Number, { description: "The quantity of crop stolen" })
        quantity: number
}