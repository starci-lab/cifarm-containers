import { Field, ID, InputType, ObjectType } from "@nestjs/graphql"
import { PlacedItemSchema } from "@src/databases"
import { IPaginatedResponse, PaginatedRequest, PaginatedResponse } from "@src/graphql"
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

@InputType()
export class StoredPlacedItemsRequest extends PaginatedRequest {
    @IsOptional()
    @IsMongoId()
    @Field(() => ID, {
        description: "Current user id watching, if not provided, will use the current user",
        nullable: true
    })
        userId?: string
}

@ObjectType()
export class StoredPlacedItemsResponse
    extends PaginatedResponse
    implements IPaginatedResponse<PlacedItemSchema>
{
    @Field(() => [PlacedItemSchema])
        data: Array<PlacedItemSchema>
}
