import { IsInt, IsPositive } from "class-validator"
import { InputType, Field, ObjectType } from "@nestjs/graphql"
import { IResponseLike, ResponseLike } from "@src/graphql"
import { TxResponse } from "../types"

@InputType()
export class MintOffchainTokensRequest {
    @IsInt()
    @IsPositive()
    @Field(() => Number, { description: "The amount of tokens to mint" })
        amount: number
}

@ObjectType()
export class MintOffchainTokensResponse extends ResponseLike implements IResponseLike<TxResponse> {
    @Field(() => TxResponse)
        data: TxResponse
}
