import { IsInt, IsMongoId } from "class-validator"
import { InputType, Field, ObjectType } from "@nestjs/graphql"

@InputType()
export class ThiefPlantRequest {
    @IsMongoId()
    @Field(() => String, { description: "The ID of the tile to steal plant from" })
        placedItemTileId: string
}

@ObjectType()
export class ThiefPlantResponse {
    @IsInt()
    @Field(() => Number, { description: "The quantity of plant stolen" })
        quantity: number
}