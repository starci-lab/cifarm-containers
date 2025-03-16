import { BuildingId } from "@src/databases"
import { Type } from "class-transformer"
import { IsString, ValidateNested } from "class-validator"
import { Position } from "@src/gameplay"
import { Field, InputType } from "@nestjs/graphql"

@InputType() 
export class BuyBuildingRequest {
    @IsString()
    @Field(() => String, { description: "The ID of the building" })
        buildingId: BuildingId

    @ValidateNested()
    @Type(() => Position)
    @Field(() => Position, { description: "The position of the building" })
        position: Position
}
