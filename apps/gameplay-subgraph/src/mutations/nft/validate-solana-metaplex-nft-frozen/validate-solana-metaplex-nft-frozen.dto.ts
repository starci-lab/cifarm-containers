import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { ResponseLike } from "@src/graphql"
import { IsBase58 } from "class-validator"

@InputType({
    description: "Validate Solana metaplex nft frozen request"
})
export class ValidateSolanaMetaplexNFTFrozenRequest {
    @IsBase58()
    @Field(() => String)
        nftAddress: string
}

@ObjectType({
    description: "Validate Solana metaplex nft frozen response"
})
export class ValidateSolanaMetaplexNFTFrozenResponse extends ResponseLike {}  
