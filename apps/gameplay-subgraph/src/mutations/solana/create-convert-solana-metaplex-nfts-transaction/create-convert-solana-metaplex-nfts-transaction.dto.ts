import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { GraphQLTypeNFTType, NFTType } from "@src/databases"
import { ChainKey } from "@src/env"
import { GraphQLTypeChainKey } from "@src/env"
import { IResponseLike, ResponseLike } from "@src/graphql"
import { IsBase58, IsEnum, IsOptional } from "class-validator"

@InputType({
    description: "Create Convert Solana Metaplex NFTs Transaction request"
})
export class CreateConvertSolanaMetaplexNFTsTransactionRequest {
    @IsBase58({ each: true })
    @Field(() => [String])
        convertNFTAddresses: Array<string>

    @IsEnum(NFTType)
    @Field(() => GraphQLTypeNFTType)
        burnNFTType: NFTType

    @IsEnum(NFTType)
    @Field(() => GraphQLTypeNFTType)
        nftType: NFTType

    @IsBase58()
    @Field(() => String)
        accountAddress: string

    @IsOptional()
    @IsEnum(ChainKey)
    @Field(() => GraphQLTypeChainKey, {
        description: "The chain key of the transaction",
        nullable: true
    })
        chainKey?: ChainKey
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
