import { Field, ID, InputType } from "@nestjs/graphql"
import { IsBoolean, IsMongoId, IsOptional } from "class-validator"

@InputType()
export class PlacedItemsRequest {
    @IsOptional()
    @IsBoolean()
    @Field(() => Boolean, {
        description: "Whether to store the result in the cache",
        defaultValue: false
    })
        storeAsCache: boolean   

    @IsOptional()
    @IsMongoId()
    @Field(() => ID, {
        description: "Current user id watching, if not provided, will use the current user",
        nullable: true
    })
        userId?: string
}
