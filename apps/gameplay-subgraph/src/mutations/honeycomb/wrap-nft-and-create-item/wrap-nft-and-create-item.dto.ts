import { IsInt, IsPositive } from "class-validator"
import { InputType, Field, ObjectType } from "@nestjs/graphql"
import { IResponseLike, ResponseLike } from "@src/graphql"
import { TxResponse } from "../types"
import { ChainKey } from "@src/env"

@InputType()
export class WrapNFTAndCreateItemRequest {
    @IsInt()
    @IsPositive()
    @Field(() => Number, { description: "The amount of tokens to mint" })
        chainKey: ChainKey
}

@ObjectType()
export class MintOffchainTokensResponse extends ResponseLike implements IResponseLike<TxResponse> {
    @Field(() => TxResponse)
        data: TxResponse
}
