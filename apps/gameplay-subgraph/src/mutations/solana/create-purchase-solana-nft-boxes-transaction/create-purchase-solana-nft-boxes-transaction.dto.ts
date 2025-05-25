import { Field, InputType, Int, ObjectType } from "@nestjs/graphql"
import { IResponseLike, ResponseLike } from "@src/graphql"
import { IsBase58, IsInt } from "class-validator"

@InputType({
    description: "Create Purchase Solana NFT Boxes Transaction request"
})
export class CreatePurchaseSolanaNFTBoxesTransactionRequest {
    @IsBase58()
    @Field(() => String, {
        description: "The account address of the user"
    })
        accountAddress: string

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
    @IsBase58({ each: true })
    @Field(() => [String], {
        description: "The serialized transactions"
    })
        serializedTxs: Array<string>
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
