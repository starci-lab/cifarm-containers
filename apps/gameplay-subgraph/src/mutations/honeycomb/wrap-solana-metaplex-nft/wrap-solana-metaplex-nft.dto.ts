import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { IResponseLike, ResponseLike } from "@src/graphql"
import {  IsOptional, IsString } from "class-validator"
import { TxResponses } from "../types"

@InputType({
    description: "Wrap Solana Metaplex NFT Request"
})
export class WrapSolanaMetaplexNFTRequest {
    @IsString()
    @Field(() => String)
        nftAddress: string

    @IsString()
    @IsOptional()
    @Field(() => String, { nullable: true })
        collectionAddress?: string
}

@ObjectType({
    description: "Wrap Solana Metaplex NFT Response"
})
export class WrapSolanaMetaplexNFTResponse extends ResponseLike implements IResponseLike<TxResponses> {
    @Field(() => TxResponses)
        data: TxResponses
}  
