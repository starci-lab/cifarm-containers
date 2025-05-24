import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { GraphQLTypeNFTRarity, GraphQLTypeNFTType, NFTRarity, NFTType } from "@src/databases"
import { IResponseLike, ResponseLike } from "@src/graphql"
import { IsBase58 } from "class-validator"

@InputType({
    description: "Send Convert Metaplex NFTs Solana Transaction request"
})
export class SendConvertSolanaMetaplexNFTsTransactionRequest {
    // the tx signed by the user
    @IsBase58({ each: true })
    @Field(() => [String])
        serializedTxs: Array<string>
}

@ObjectType({
    description: "Converted NFT"
})
export class GraphQLConvertedNFT {
    @Field(() => String, { description: "The NFT name" })
        nftName: string

    @Field(() => GraphQLTypeNFTType, { description: "The NFT type" })
        nftType: NFTType

    @Field(() => GraphQLTypeNFTRarity, { description: "The NFT rarity" })
        rarity: NFTRarity   

    @Field(() => String, { description: "The NFT address" })
        nftAddress: string
}

@ObjectType({
    description: "Send Convert Metaplex NFT Solana Transaction response data"
})
export class SendConvertSolanaMetaplexNFTsTransactionResponseData {
    @IsBase58({ each: true })
    @Field(() => String)
        txHash: string

    @Field(() => [GraphQLConvertedNFT], { description: "The converted NFTs" })
        convertedNFTs: Array<GraphQLConvertedNFT> 
}

@ObjectType({
    description: "Send Convert Metaplex NFTs Solana Transaction response"
})
export class SendConvertSolanaMetaplexNFTsTransactionResponse
    extends ResponseLike
    implements IResponseLike<SendConvertSolanaMetaplexNFTsTransactionResponseData>
{
    @Field(() => SendConvertSolanaMetaplexNFTsTransactionResponseData)
        data: SendConvertSolanaMetaplexNFTsTransactionResponseData
}
