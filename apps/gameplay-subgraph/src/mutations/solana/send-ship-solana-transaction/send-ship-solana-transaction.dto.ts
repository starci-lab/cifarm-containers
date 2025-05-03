import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { IResponseLike, ResponseLike } from "@src/graphql"
import { IsBase58 } from "class-validator"

@InputType({
    description: "Send Ship Solana Transaction request"
})
export class SendShipSolanaTransactionRequest {
    // the tx signed by the user
    @IsBase58()
    @Field(() => String)
        serializedTx: string
}

@ObjectType({
    description: "Send Ship Solana Transaction response data"
})
export class SendShipSolanaTransactionResponseData {
    @IsBase58()
    @Field(() => String, { description: "The transaction hash" })
        txHash: string
}

@ObjectType({
    description: "Send Ship Solana Transaction response"
})
export class SendShipSolanaTransactionResponse
    extends ResponseLike
    implements IResponseLike<SendShipSolanaTransactionResponseData>
{
    @Field(() => SendShipSolanaTransactionResponseData)
        data: SendShipSolanaTransactionResponseData
}
