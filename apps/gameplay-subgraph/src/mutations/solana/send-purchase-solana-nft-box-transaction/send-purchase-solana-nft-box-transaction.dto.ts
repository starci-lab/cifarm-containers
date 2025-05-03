import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { IResponseLike, ResponseLike } from "@src/graphql"
import { IsBase58 } from "class-validator"

@InputType({
    description: "Send Purchase Solana NFT Box Transaction request"
})
export class SendPurchaseSolanaNFTBoxTransactionRequest {
    // the tx signed by the user
    @IsBase58()
    @Field(() => String)
        serializedTx: string
}

@ObjectType({
    description: "Send Purchase Solana NFT Box Transaction response data"
})
export class SendPurchaseSolanaNFTBoxTransactionResponseData {
    @IsBase58()
    @Field(() => String)
        txHash: string
}

@ObjectType({
    description: "Send Purchase Solana NFT Box Transaction response"
})
export class SendPurchaseSolanaNFTBoxTransactionResponse
    extends ResponseLike
    implements IResponseLike<SendPurchaseSolanaNFTBoxTransactionResponseData>
{
    @Field(() => SendPurchaseSolanaNFTBoxTransactionResponseData)
        data: SendPurchaseSolanaNFTBoxTransactionResponseData
}
