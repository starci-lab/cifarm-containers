import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { IResponseLike, ResponseLike } from "@src/graphql"
import { IsBase58 } from "class-validator"

@InputType({
    description: "Send Expand Land Limit Solana Transaction request"
})
export class SendExpandLandLimitSolanaTransactionRequest {
    // the tx signed by the user
    @IsBase58()
    @Field(() => String)
        serializedTx: string
}

@ObjectType({
    description: "Send Expand Land Limit Solana Transaction response data"
})
export class SendExpandLandLimitSolanaTransactionResponseData {
    @IsBase58()
    @Field(() => String)
        txHash: string
}

@ObjectType({
    description: "Send Expand Land Limit Solana Transaction response"
})
export class SendExpandLandLimitSolanaTransactionResponse
    extends ResponseLike
    implements IResponseLike<SendExpandLandLimitSolanaTransactionResponseData>
{
    @Field(() => SendExpandLandLimitSolanaTransactionResponseData)
        data: SendExpandLandLimitSolanaTransactionResponseData
}
