import { BuildingId, FirstCharLowerCaseBuildingId } from "@src/databases"
import { Type } from "class-transformer"
import { IsString, ValidateNested } from "class-validator"
import { PositionInput } from "@src/gameplay"
import { Field, InputType } from "@nestjs/graphql"

@InputType() 
export class BuyBuildingRequest {
    @IsString()
    @Field(() => FirstCharLowerCaseBuildingId, { description: "The ID of the building" })
        buildingId: BuildingId

    @ValidateNested()
    @Type(() => PositionInput)
    @Field(() => PositionInput, { description: "The position of the building" })
        position: PositionInput
}
