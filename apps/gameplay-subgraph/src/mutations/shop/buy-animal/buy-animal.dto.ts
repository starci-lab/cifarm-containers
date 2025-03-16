import { AnimalId } from "@src/databases"
import { Type } from "class-transformer"
import { IsString, ValidateNested } from "class-validator"
import { Position, PositionInput } from "@src/gameplay"
import { Field, InputType } from "@nestjs/graphql"     

@InputType()
export class BuyAnimalRequest {
    @IsString()
    @Field(() => String, { description: "The ID of the animal" })
        animalId: AnimalId

    @ValidateNested()
    @Type(() => PositionInput)
    @Field(() => PositionInput, { description: "The position of the animal" })
        position: Position
}