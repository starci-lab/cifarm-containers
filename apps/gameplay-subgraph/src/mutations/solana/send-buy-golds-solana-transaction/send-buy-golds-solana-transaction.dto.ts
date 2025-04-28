import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { IResponseLike, ResponseLike } from "@src/graphql"
import { IsBase58 } from "class-validator"

@InputType({
    description: "Send Buy Golds Solana Transaction request"
})
export class SendBuyGoldsSolanaTransactionRequest {
    // the tx signed by the user
    @IsBase58()
    @Field(() => String)
        serializedTx: string
}

@ObjectType({
    description: "Send Buy Golds Solana Transaction response data"
})
export class SendBuyGoldsSolanaTransactionResponseData {
    @IsBase58()
    @Field(() => String)
        txHash: string
}

@ObjectType({
    description: "Send Buy Golds Solana Transaction response"
})
export class SendBuyGoldsSolanaTransactionResponse
    extends ResponseLike
    implements IResponseLike<SendBuyGoldsSolanaTransactionResponseData>
{
    @Field(() => SendBuyGoldsSolanaTransactionResponseData)
        data: SendBuyGoldsSolanaTransactionResponseData
}
