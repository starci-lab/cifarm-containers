import { IsMongoId } from "class-validator"
import { Field, InputType } from "@nestjs/graphql"

@InputType()
export class UpgradeBuildingRequest {
    @IsMongoId()
    @Field(() => String, { description: "The id of the placed item building to upgrade" })
        placedItemBuildingId: string
}