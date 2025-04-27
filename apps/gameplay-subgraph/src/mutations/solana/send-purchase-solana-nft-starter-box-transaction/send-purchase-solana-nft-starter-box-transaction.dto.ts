import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { IResponseLike, ResponseLike } from "@src/graphql"
import { IsBase58 } from "class-validator"

@InputType({
    description: "Send Purchase Solana NFT Starter Box Transaction request"
})
export class SendPurchaseSolanaNFTStarterBoxTransactionRequest {
    // the tx signed by the user
    @IsBase58()
    @Field(() => String)
        serializedTx: string
}

@ObjectType({
    description: "Send Purchase Solana NFT Starter Box Transaction response data"
})
export class SendPurchaseSolanaNFTStarterBoxTransactionResponseData {
    @IsBase58()
    @Field(() => String)
        txHash: string
}

@ObjectType({
    description: "Send Purchase Solana NFT Starter Box Transaction response"
})
export class SendPurchaseSolanaNFTStarterBoxTransactionResponse
    extends ResponseLike
    implements IResponseLike<SendPurchaseSolanaNFTStarterBoxTransactionResponseData>
{
    @Field(() => SendPurchaseSolanaNFTStarterBoxTransactionResponseData)
        data: SendPurchaseSolanaNFTStarterBoxTransactionResponseData
}
