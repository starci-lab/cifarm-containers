import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { GraphQLTypeNFTRarity, GraphQLTypeNFTCollectionKey, NFTRarity, NFTCollectionKey } from "@src/databases"
import { IResponseLike, ResponseLike } from "@src/graphql"
import { IsBase58 } from "class-validator"

@InputType({
    description: "Send Purchase Solana NFT Boxes Transaction request"
})
export class SendPurchaseSolanaNFTBoxesTransactionRequest {
    // the tx signed by the user
    @IsBase58({ each: true })
    @Field(() => [String])
        serializedTxs: Array<string>
}

@ObjectType({
    description: "Extended NFT Box"
})
export class GraphQLExtendedNFTBox {
    @Field(() => String, { description: "The NFT name" })
        nftName: string

    @Field(() => GraphQLTypeNFTCollectionKey, { description: "The NFT type" })
        nftCollectionKey: NFTCollectionKey

    @Field(() => GraphQLTypeNFTRarity, { description: "The NFT rarity" })
        rarity: NFTRarity   

    @Field(() => String, { description: "The NFT address" })
        nftAddress: string
}

@ObjectType({
    description: "Send Purchase Solana NFT Boxes Transaction response data"
})
export class SendPurchaseSolanaNFTBoxesTransactionResponseData {
    @IsBase58()
    @Field(() => String)
        txHash: string

    @Field(() => [GraphQLExtendedNFTBox], { description: "The NFT type" })
        nftBoxes: Array<GraphQLExtendedNFTBox> 
}

@ObjectType({
    description: "Send Purchase Solana NFT Boxes Transaction response"
})
export class SendPurchaseSolanaNFTBoxesTransactionResponse
    extends ResponseLike
    implements IResponseLike<SendPurchaseSolanaNFTBoxesTransactionResponseData>
{
    @Field(() => SendPurchaseSolanaNFTBoxesTransactionResponseData)
        data: SendPurchaseSolanaNFTBoxesTransactionResponseData
}
