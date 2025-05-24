import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { IResponseLike, ResponseLike } from "@src/graphql"
import { IsBase58 } from "class-validator"

@InputType({
    description: "Send Buy Energy Solana Transaction request"
})
export class SendBuyEnergySolanaTransactionRequest {
    // the tx signed by the user
    @IsBase58()
    @Field(() => String)
        serializedTx: string
}

@ObjectType({
    description: "Send Buy Energy Solana Transaction response"
})
export class SendBuyEnergySolanaTransactionResponseData {
    @IsBase58()
    @Field(() => String)
        txHash: string
}

@ObjectType({
    description: "Send Buy Energy Solana Transaction response"
})
export class SendBuyEnergySolanaTransactionResponse
    extends ResponseLike
    implements IResponseLike<SendBuyEnergySolanaTransactionResponseData>
{
    @Field(() => SendBuyEnergySolanaTransactionResponseData)
        data: SendBuyEnergySolanaTransactionResponseData
}
