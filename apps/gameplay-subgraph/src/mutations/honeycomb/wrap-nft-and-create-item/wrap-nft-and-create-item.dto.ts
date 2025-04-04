import { IsNotEmpty, IsString } from "class-validator"
import { InputType, Field, ObjectType } from "@nestjs/graphql"
import { IResponseLike, ResponseLike } from "@src/graphql"
import { TxResponse } from "../types"
import { ChainKey, FirstCharLowerCaseChainKey, FirstCharLowerCaseNetwork, Network } from "@src/env"

@InputType()
export class WrapNFTAndCreateItemRequest {
    @IsString()
    @Field(() => FirstCharLowerCaseChainKey, { description: "The chain of the nft" })
        chainKey: ChainKey

    @IsString()
    @IsNotEmpty()
    @Field(() => String, { description: "The nft address" })
        nftAddress: string

    @IsString()
    @IsNotEmpty()
    @Field(() => FirstCharLowerCaseNetwork, { description: "The network of the nft" })
        network: Network

    @IsString()
    @IsNotEmpty()
    @Field(() => String, { description: "The collection address of the nft" })
        collectionAddress: string
}

@ObjectType()
export class WrapNFTAndCreateItemResponse extends ResponseLike implements IResponseLike<TxResponse> {
    @Field(() => TxResponse)
        data: TxResponse
}
