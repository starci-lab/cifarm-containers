import { Field, ID, InputType } from "@nestjs/graphql"
import { IsMongoId, IsOptional } from "class-validator"

@InputType()
export class PlacedItemsRequest {
    @IsOptional()
    @IsMongoId()
    @Field(() => ID, {
        description: "Current user id watching, if not provided, will use the current user",
        nullable: true
    })
        userId?: string
}
