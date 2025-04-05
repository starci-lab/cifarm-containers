import { ObjectType, Field } from "@nestjs/graphql"
import { EdgeTxResponse, EdgeTxResponses } from "@src/honeycomb"
import { Min, IsString } from "class-validator"

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

@ObjectType()
export class TxResponses implements EdgeTxResponses {
    @IsString({ each: true })
    @Field(() => [String], { description: "The transaction responses" })
        transactions: Array<string>
    @IsString()
    @Field(() => String, { description: "The block hash" })
        blockhash: string
    @Min(0)
    @Field(() => Number, { description: "The last valid block height" })
        lastValidBlockHeight: number
}

