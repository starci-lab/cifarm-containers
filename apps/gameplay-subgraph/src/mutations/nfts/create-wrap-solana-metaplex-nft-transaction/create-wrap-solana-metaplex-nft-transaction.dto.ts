import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { IResponseLike, ResponseLike } from "@src/graphql"
import { IsBase58, IsOptional } from "class-validator"

@InputType({
    description: "Create Wrap Solana Metaplex NFT Transaction request"
})
export class CreateWrapSolanaMetaplexNFTTransactionRequest {
    @IsBase58()
    @Field(() => String)
        nftAddress: string

    @IsBase58()
    @IsOptional()
    @Field(() => String, { nullable: true })
        collectionAddress?: string
}

@ObjectType({
    description: "Create Wrap Solana Metaplex NFT Transaction response"
})
export class CreateWrapSolanaMetaplexNftTransactionResponseData {
    @IsBase58()
    @Field(() => String)
        serializedTx: string
}

@ObjectType({
    description: "Create Wrap Solana Metaplex NFT Transaction response"
})
export class CreateWrapSolanaMetaplexNFTTransactionResponse
    extends ResponseLike
    implements IResponseLike<CreateWrapSolanaMetaplexNftTransactionResponseData>
{
    @Field(() => CreateWrapSolanaMetaplexNftTransactionResponseData)
        data: CreateWrapSolanaMetaplexNftTransactionResponseData
}
