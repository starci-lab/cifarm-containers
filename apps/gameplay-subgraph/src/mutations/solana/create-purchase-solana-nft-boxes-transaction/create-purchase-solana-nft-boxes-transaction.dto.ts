import { Field, InputType, Int, ObjectType } from "@nestjs/graphql"
import { GraphQLTypeChainKey, ChainKey } from "@src/env"
import { IResponseLike, ResponseLike } from "@src/graphql"
import { IsBase58, IsEnum, IsInt, IsOptional } from "class-validator"

@InputType({
    description: "Create Purchase Solana NFT Boxes Transaction request"
})
export class CreatePurchaseSolanaNFTBoxesTransactionRequest {
    @IsBase58()
    @Field(() => String, {
        description: "The account address of the user"
    })
        accountAddress: string

    @IsOptional()
    @IsEnum(ChainKey)
    @Field(() => GraphQLTypeChainKey, {
        description: "The chain key of the transaction",
        nullable: true
    })
        chainKey?: ChainKey

    @IsInt()
    @Field(() => Int, {
        description: "The number of NFT boxes to purchase",
        nullable: true
    })
        quantity?: number
}

@ObjectType({
    description: "Create Purchase Solana NFT Box Transaction response data"
})
export class CreatePurchaseSolanaNFTBoxesTransactionResponseData {
    @IsBase58()
    @Field(() => String, {
        description: "The serialized transaction"
    })
        serializedTx: string
}

@ObjectType({
    description: "Create Purchase Solana NFT Boxes Transaction response"
})
export class CreatePurchaseSolanaNFTBoxesTransactionResponse
    extends ResponseLike
    implements IResponseLike<CreatePurchaseSolanaNFTBoxesTransactionResponseData>
{
    @Field(() => CreatePurchaseSolanaNFTBoxesTransactionResponseData)
        data: CreatePurchaseSolanaNFTBoxesTransactionResponseData
}
