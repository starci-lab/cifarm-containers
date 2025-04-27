import { Field, ID, InputType, ObjectType } from "@nestjs/graphql"
import { ResponseLike } from "@src/graphql"
import { IsMongoId } from "class-validator"
@InputType()
export class ShipWholesaleMarketInventoriesRequest {
    @IsMongoId({ each: true })
    @Field(() => [ID], { description: "Inventory ids" })
        inventoryIds: Array<string>

    @IsMongoId()
    @Field(() => ID, { description: "Product id" })
        productId: string
}

@ObjectType()
export class ShipWholesaleMarketInventoriesResponse extends ResponseLike {}

