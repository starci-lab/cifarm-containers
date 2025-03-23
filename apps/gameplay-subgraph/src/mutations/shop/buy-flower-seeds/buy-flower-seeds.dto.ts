// buy-seed.dto.ts

import { FlowerId, FirstCharLowerCaseFlowerId } from "@src/databases"
import { IsInt, IsString, Min } from "class-validator"
import { Field, InputType } from "@nestjs/graphql"

@InputType()
export class BuyFlowerSeedsRequest {
    @IsString()
    @Field(() => FirstCharLowerCaseFlowerId, { description: "The id of the seed to purchase" })
        flowerId: FlowerId

    @IsInt()
    @Min(1)
    @Field(() => Number, { description: "The quantity of seeds to purchase" })
        quantity: number
}
