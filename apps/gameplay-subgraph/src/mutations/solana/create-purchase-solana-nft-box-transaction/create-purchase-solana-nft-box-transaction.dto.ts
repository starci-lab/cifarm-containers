import { Field, ObjectType } from "@nestjs/graphql"
import { IResponseLike, ResponseLike } from "@src/graphql"
import { IsBase58 } from "class-validator"
@ObjectType({
    description: "Create Purchase Solana NFT Box Transaction response data"
})
export class CreatePurchaseSolanaNFTBoxTransactionResponseData {
    @IsBase58()
    @Field(() => String)
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
