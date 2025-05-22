import { Field, InputType, Int, ObjectType } from "@nestjs/graphql"
import { GraphQLTypeChainKey, ChainKey } from "@src/env"
import { IResponseLike, ResponseLike } from "@src/graphql"
import { IsBase58, IsEnum, IsInt, IsOptional, IsString } from "class-validator"

@InputType({
    description: "Create Purchase Sui NFT Boxes Transaction request"
})
export class CreatePurchaseSuiNFTBoxesTransactionRequest {
    @IsString()
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
    description: "Create Purchase Sui NFT Box Transaction response data"
})
export class CreatePurchaseSuiNFTBoxesTransactionResponseData {
    @IsBase58({ each: true })
    @Field(() => [String], {
        description: "The serialized transactions"
    })
        serializedTxs: Array<string>
}

@ObjectType({
    description: "Create Purchase Sui NFT Boxes Transaction response"
})
export class CreatePurchaseSuiNFTBoxesTransactionResponse
    extends ResponseLike
    implements IResponseLike<CreatePurchaseSuiNFTBoxesTransactionResponseData>
{
    @Field(() => CreatePurchaseSuiNFTBoxesTransactionResponseData)
        data: CreatePurchaseSuiNFTBoxesTransactionResponseData
}
