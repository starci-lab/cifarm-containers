import { Field, ID, InputType, ObjectType } from "@nestjs/graphql"
import { ResponseLike } from "@src/graphql"
import { IsMongoId } from "class-validator"
@InputType()
export class ShipWholesaleMarketRequest {
    @IsMongoId({ each: true })
    @Field(() => [ID], { description: "The ids of the inventory" })
        inventoryIds: Array<string>
}

@ObjectType()
export class ShipWholesaleMarketResponse extends ResponseLike {}

