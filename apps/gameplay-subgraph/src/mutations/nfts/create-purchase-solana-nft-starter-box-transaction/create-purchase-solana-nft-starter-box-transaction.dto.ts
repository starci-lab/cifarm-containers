import { Field, ObjectType } from "@nestjs/graphql"
import { IResponseLike, ResponseLike } from "@src/graphql"
import { IsBase58 } from "class-validator"
@ObjectType({
    description: "Create Purchase Solana NFT Starter Box Transaction response"
})
export class CreatePurchaseSolanaNFTStarterBoxTransactionResponseData {
    @IsBase58()
    @Field(() => String)
        serializedTx: string
}

@ObjectType({
    description: "Create Purchase Solana NFT Starter Box Transaction response"
})
export class CreatePurchaseSolanaNFTStarterBoxTransactionResponse
    extends ResponseLike
    implements IResponseLike<CreatePurchaseSolanaNFTStarterBoxTransactionResponseData>
{
    @Field(() => CreatePurchaseSolanaNFTStarterBoxTransactionResponseData)
        data: CreatePurchaseSolanaNFTStarterBoxTransactionResponseData
}
