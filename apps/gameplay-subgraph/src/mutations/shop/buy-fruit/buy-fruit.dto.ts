import { FirstCharLowerCaseFruitId, FruitId } from "@src/databases"
import { PositionInput } from "@src/gameplay"
import { Type } from "class-transformer"
import { ValidateNested, IsString } from "class-validator"
import { Field, InputType } from "@nestjs/graphql"

@InputType()
export class BuyFruitRequest {
    @ValidateNested()
    @Type(() => PositionInput)
    @Field(() => PositionInput, { description: "The position of the fruit" })
        position: PositionInput
    
    @IsString()
    @Field(() => FirstCharLowerCaseFruitId, { description: "The ID of the fruit" })
        fruitId: FruitId
}