import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { GraphQLTypeNFTCollectionKey, NFTCollectionKey } from "@src/databases"
import { IResponseLike, ResponseLike } from "@src/graphql"
import { IsBase58, IsEnum } from "class-validator"

@InputType({
    description: "Create Convert Solana Metaplex NFTs Transaction request"
})
export class CreateConvertSolanaMetaplexNFTsTransactionRequest {
    @IsBase58({ each: true })
    @Field(() => [String])
        convertNFTAddresses: Array<string>

    @IsEnum(NFTCollectionKey)
    @Field(() => GraphQLTypeNFTCollectionKey)
        burnNFTCollectionKey: NFTCollectionKey

    @IsEnum(NFTCollectionKey)
    @Field(() => GraphQLTypeNFTCollectionKey)
        nftCollectionKey: NFTCollectionKey

    @IsBase58()
    @Field(() => String)
        accountAddress: string
}

@ObjectType({
    description: "Create Convert Solana Metaplex NFTs Transaction response"
})
export class CreateConvertSolanaMetaplexNFTsTransactionResponseData {
    @IsBase58({ each: true })
    @Field(() => [String])
        serializedTxs: Array<string>
}

@ObjectType({
    description: "Create Convert Solana Metaplex NFTs Transaction response"
})
export class CreateConvertSolanaMetaplexNFTsTransactionResponse
    extends ResponseLike
    implements IResponseLike<CreateConvertSolanaMetaplexNFTsTransactionResponseData>
{
    @Field(() => CreateConvertSolanaMetaplexNFTsTransactionResponseData)
        data: CreateConvertSolanaMetaplexNFTsTransactionResponseData
}
