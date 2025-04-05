import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { IResponseLike, ResponseLike } from "@src/graphql"
import {  IsOptional, IsString } from "class-validator"

@InputType({
    description: "Freeze Solana Metaplex NFT request"
})
export class FreezeSolanaMetaplexNFTRequest {
    @IsString()
    @Field(() => String)
        nftAddress: string

    @IsString()
    @IsOptional()
    @Field(() => String, { nullable: true })
        collectionAddress?: string
}

@ObjectType({
    description: "Freeze Solana Metaplex NFT response"
})
export class FreezeSolanaMetaplexNFTResponseData  {
    @Field(() => String)
        serializedTx: string
}  

@ObjectType({
    description: "Freeze Solana Metaplex NFT response"
})
export class FreezeSolanaMetaplexNFTResponse extends ResponseLike implements IResponseLike<FreezeSolanaMetaplexNFTResponseData> {
    @Field(() => FreezeSolanaMetaplexNFTResponseData)
        data: FreezeSolanaMetaplexNFTResponseData
}  
