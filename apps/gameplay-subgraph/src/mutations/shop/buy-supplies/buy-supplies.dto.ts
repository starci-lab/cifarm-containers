// buy-supplies.dto.ts

import { SupplyId } from "@src/databases"
import { IsInt, IsString, Min } from "class-validator"
import { Field, InputType } from "@nestjs/graphql"

@InputType() 
export class BuySuppliesRequest {
    @IsString()
    @Field(() => String, { description: "The id of the supply to purchase" })
        supplyId: SupplyId

    @IsInt()
    @Min(1)
    @Field(() => Number, { description: "The quantity of supplies to purchase" })
        quantity: number
}
