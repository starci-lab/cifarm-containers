import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { IResponseLike } from "@src/graphql"
import { ResponseLike } from "@src/graphql"
import { IsBase58, IsOptional } from "class-validator"

@InputType({
    description: "Create Unwrap Solana Metaplex NFT Transaction request"
})
export class CreateUnwrapSolanaMetaplexNFTTransactionRequest {
    @IsBase58()
    @Field(() => String)
        nftAddress: string

    @IsBase58()
    @IsOptional()
    @Field(() => String, { nullable: true })
        collectionAddress?: string
}

@ObjectType({
    description: "Create Unwrap Solana Metaplex NFT Transaction response"
})
export class CreateUnwrapSolanaMetaplexNFTTransactionResponseData {
    @IsBase58()
    @Field(() => String)
        serializedTx: string
}

@ObjectType({
    description: "Create Unwrap Solana Metaplex NFT Transaction response"
})
export class CreateUnwrapSolanaMetaplexNFTTransactionResponse
    extends ResponseLike
    implements IResponseLike<CreateUnwrapSolanaMetaplexNFTTransactionResponseData>
{
    @Field(() => CreateUnwrapSolanaMetaplexNFTTransactionResponseData)
        data: CreateUnwrapSolanaMetaplexNFTTransactionResponseData
}