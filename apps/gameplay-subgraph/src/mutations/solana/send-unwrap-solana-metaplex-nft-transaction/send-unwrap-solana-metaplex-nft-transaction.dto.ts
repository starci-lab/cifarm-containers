import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { IResponseLike, ResponseLike } from "@src/graphql"
import { IsBase58 } from "class-validator"

@InputType({
    description: "Send unwrap solana metaplex nft transaction request"
})
export class SendUnwrapSolanaMetaplexNFTTransactionRequest {
    // the tx signed by the user
    @IsBase58()
    @Field(() => String)
        serializedTx: string
}

@ObjectType({
    description: "Send Unwrap Solana Metaplex NFT Transaction response data"
})
export class SendUnwrapSolanaMetaplexNFTTransactionResponseData {
    @IsBase58()
    @Field(() => String)
        txHash: string
}

@ObjectType({
    description: "Send Unwrap Solana Metaplex NFT Transaction response"
})
export class SendUnwrapSolanaMetaplexNFTTransactionResponse
    extends ResponseLike
    implements IResponseLike<SendUnwrapSolanaMetaplexNFTTransactionResponseData>
{
    @Field(() => SendUnwrapSolanaMetaplexNFTTransactionResponseData)
        data: SendUnwrapSolanaMetaplexNFTTransactionResponseData
}
