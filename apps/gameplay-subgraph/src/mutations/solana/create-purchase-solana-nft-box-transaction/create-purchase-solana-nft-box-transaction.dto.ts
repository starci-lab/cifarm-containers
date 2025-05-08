import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { GraphQLTypeChainKey, Network, ChainKey } from "@src/env"
import { GraphQLTypeNetwork } from "@src/env"
import { IResponseLike, ResponseLike } from "@src/graphql"
import { IsBase58, IsEnum, IsOptional } from "class-validator"

@InputType({
    description: "Create Purchase Solana NFT Box Transaction request"
})
export class CreatePurchaseSolanaNFTBoxTransactionRequest {
    @IsBase58()
    @Field(() => String, {
        description: "The account address of the user"
    })
        accountAddress: string

    @IsOptional()
    @IsEnum(Network)
    @Field(() => GraphQLTypeNetwork, {
        description: "The network of the user",
        nullable: true
    })
        network?: Network

    @IsOptional()
    @IsEnum(ChainKey)
    @Field(() => GraphQLTypeChainKey, {
        description: "The chain key of the transaction",
        nullable: true
    })
        chainKey?: ChainKey
}

@ObjectType({
    description: "Create Purchase Solana NFT Box Transaction response data"
})
export class CreatePurchaseSolanaNFTBoxTransactionResponseData {
    @IsBase58()
    @Field(() => String, {
        description: "The serialized transaction"
    })
        serializedTx: string
}

@ObjectType({
    description: "Create Purchase Solana NFT Box Transaction response"
})
export class CreatePurchaseSolanaNFTBoxTransactionResponse
    extends ResponseLike
    implements IResponseLike<CreatePurchaseSolanaNFTBoxTransactionResponseData>
{
    @Field(() => CreatePurchaseSolanaNFTBoxTransactionResponseData)
        data: CreatePurchaseSolanaNFTBoxTransactionResponseData
}
