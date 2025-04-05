import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { IResponseLike, ResponseLike } from "@src/graphql"
import { IsBase58 } from "class-validator"

@InputType({
    description: "Unfreeze Solana Metaplex NFT request"
})
export class UnfreezeSolanaMetaplexNFTRequest {
    @IsBase58()
    @Field(() => String)
        nftAddress: string
}

@ObjectType({
    description: "Unfreeze Solana Metaplex NFT response"
})
export class UnfreezeSolanaMetaplexNFTResponseData  {
    @Field(() => String)
        serializedTx: string
}  

@ObjectType({
    description: "Freeze Solana Metaplex NFT response"
})
export class UnfreezeSolanaMetaplexNFTResponse extends ResponseLike implements IResponseLike<UnfreezeSolanaMetaplexNFTResponseData> {
    @Field(() => UnfreezeSolanaMetaplexNFTResponseData)
        data: UnfreezeSolanaMetaplexNFTResponseData
}  
