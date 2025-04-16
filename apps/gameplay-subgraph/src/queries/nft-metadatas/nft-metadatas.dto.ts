import { InputType, Field, ObjectType } from "@nestjs/graphql"
import { IsString, IsBoolean, IsArray } from "class-validator"

@InputType({
    description: "Get Solana Metaplex NFT status request"
})
export class NFTsValidatedRequest {
    @IsArray()
    @IsString({ each: true })
    @Field(() => [String], { description: "The NFT addresses to check" })
        nftAddresses: Array<string>
}

@ObjectType({
    description: "NFT validated"
})
export class NFTValidated {
    @IsString()
    @Field(() => String, { description: "The NFT address" })
        nftAddress: string

    @IsBoolean()
    @Field(() => Boolean, { description: "The status of the NFT" })
        validated: boolean
}