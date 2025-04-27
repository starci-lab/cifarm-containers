import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { IResponseLike, ResponseLike } from "@src/graphql"
import { IsBase58 } from "class-validator"

@InputType({
    description: "Send Wrap Solana Metaplex NFT Transaction request"
})
export class SendWrapSolanaMetaplexNFTTransactionRequest {
    // the tx signed by the user
    @IsBase58()
    @Field(() => String)
        serializedTx: string
}

@ObjectType({
    description: "Send Wrap Solana Metaplex NFT Transaction response data"
})
export class SendWrapSolanaMetaplexNFTTransactionResponseData {
    @IsBase58()
    @Field(() => String)
        txHash: string
}

@ObjectType({
    description: "Send Wrap Solana Metaplex NFT Transaction response"
})
export class SendWrapSolanaMetaplexNFTTransactionResponse
    extends ResponseLike
    implements IResponseLike<SendWrapSolanaMetaplexNFTTransactionResponseData>
{
    @Field(() => SendWrapSolanaMetaplexNFTTransactionResponseData)
        data: SendWrapSolanaMetaplexNFTTransactionResponseData
}
