import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { GraphQLTypeNFTRarity } from "@src/databases"
import { NFTRarity } from "@src/databases"
import { NFTType } from "@src/databases"
import { GraphQLTypeNFTType } from "@src/databases"
import { IResponseLike, ResponseLike } from "@src/graphql"
import { IsBase58, IsEnum, IsString } from "class-validator"

@InputType({
    description: "Send Purchase Solana NFT Box Transaction request"
})
export class SendPurchaseSolanaNFTBoxTransactionRequest {
    // the tx signed by the user
    @IsBase58()
    @Field(() => String)
        serializedTx: string
}

@ObjectType({
    description: "Send Purchase Solana NFT Box Transaction response data"
})
export class SendPurchaseSolanaNFTBoxTransactionResponseData {
    @IsBase58()
    @Field(() => String)
        txHash: string

    @IsEnum(NFTType)
    @Field(() => GraphQLTypeNFTType, { description: "The NFT type" })
        nftType: NFTType

    @IsEnum(NFTRarity)
    @Field(() => GraphQLTypeNFTRarity, { description: "The NFT rarity" })
        rarity: NFTRarity

    @IsString()
    @Field(() => String, { description: "The NFT name" })
        nftName: string
}

@ObjectType({
    description: "Send Purchase Solana NFT Box Transaction response"
})
export class SendPurchaseSolanaNFTBoxTransactionResponse
    extends ResponseLike
    implements IResponseLike<SendPurchaseSolanaNFTBoxTransactionResponseData>
{
    @Field(() => SendPurchaseSolanaNFTBoxTransactionResponseData)
        data: SendPurchaseSolanaNFTBoxTransactionResponseData
}
