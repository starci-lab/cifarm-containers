import { ObjectType, Field } from "@nestjs/graphql"
import { EdgeTxResponse } from "@src/honeycomb"
import { Min } from "class-validator"

@ObjectType()
export class TxResponse implements EdgeTxResponse {
    @Field(() => String, { description: "The transaction hash" })
        transaction: string
    @Field(() => String, { description: "The block hash" })
        blockhash: string
    @Min(0)
    @Field(() => Number, { description: "The last valid block height" })
        lastValidBlockHeight: number
}