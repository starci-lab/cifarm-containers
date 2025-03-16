import { FruitId } from "@src/databases"
import { Position } from "@src/gameplay"
import { Type } from "class-transformer"
import { ValidateNested, IsString } from "class-validator"
import { Field, InputType } from "@nestjs/graphql"

@InputType()
export class BuyFruitRequest {
    @ValidateNested()
    @Type(() => Position)
    @Field(() => Position, { description: "The position of the fruit" })
        position: Position
    
    @IsString()
    @Field(() => String, { description: "The ID of the fruit" })
        fruitId: FruitId
}