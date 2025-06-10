import { InputType, Field, ObjectType, Float } from "@nestjs/graphql"
import { GraphQLTypeNFTType, GraphQLTypeTokenKey, NFTType, TokenKey } from "@src/databases"
import { ChainKey, GraphQLTypeChainKey } from "@src/env"
import { IsBoolean, IsEnum, IsString, ValidateNested } from "class-validator"
import { Type } from "class-transformer"

// TODO: Add more blockchain types
@InputType({
    description: "Get balances request"
})
export class GetBlockchainBalancesRequest {
    @IsEnum(TokenKey, { each: true })
    @Field(() => [GraphQLTypeTokenKey], {
        description: "Token keys"
    })
        tokenKeys: Array<TokenKey>

    @IsEnum(ChainKey)
    @Field(() => GraphQLTypeChainKey, {
        description: "Chain key"
    })
        chainKey: ChainKey

    @IsString()
    @Field(() => String, {
        description: "Account address"
    })
        accountAddress: string

    @IsBoolean()
    @Field(() => Boolean, {
        description: "Refresh to prevent abuse call to rpc"
    })
        refresh: boolean
}

// TODO: Add more blockchain types
@ObjectType({
    description: "Token data"
})
export class TokenBalanceData {
    @IsEnum(TokenKey)
    @Field(() => GraphQLTypeTokenKey, {
        description: "Blockchain token key"
    })
        tokenKey: TokenKey

    @Field(() => Float, {
        description: "Blockchain balance",
        defaultValue: 0
    })
        balance: number
}

// TODO: Add more blockchain types
@ObjectType({
    description: "Balances response data"
})
export class GetBlockchainBalancesResponse {
    @Field(() => [TokenBalanceData], {
        description: "Token data"
    })
        tokens: Array<TokenBalanceData>

    @Field(() => Boolean, {
        description: "Cache to prevent abuse call to rpc"
    })
        cached: boolean
}

@InputType({
    description: "Get blockchain collections request"
})
export class GetBlockchainCollectionsRequest {
    @IsString()
    @Field(() => String, {
        description: "Account address"
    })
        accountAddress: string

    @IsEnum(ChainKey)
    @Field(() => GraphQLTypeChainKey, {
        description: "Chain key"
    })
        chainKey: ChainKey

    @IsEnum(NFTType, { each: true })
    @Field(() => [GraphQLTypeNFTType], {
        description: "NFT type"
    })
        nftTypes: Array<NFTType>

    @IsBoolean()
    @Field(() => Boolean, {
        description: "Refresh to prevent abuse call to rpc"
    })
        refresh: boolean
}

@ObjectType({
    description: "NFT trait"
})
export class NFTTrait {
    @Field(() => String, {
        description: "Trait key"
    })
        key: string

    @Field(() => String, {
        description: "Trait value"
    })
        value: string
}

@ObjectType({
    description: "Blockchain NFT data"
})
export class BlockchainNFTData {
    @Field(() => String, {
        description: "NFT Address"
    })
        nftAddress: string

    @Field(() => [NFTTrait], {
        description: "NFT traits"
    })
        traits: Array<NFTTrait>

    @Field(() => String, {
        description: "NFT image URL"
    })
        imageUrl: string

    @Field(() => String, {
        description: "NFT name"
    })
        name: string

    @Field(() => String, {
        description: "NFT description"
    })
        description: string
}

// TODO: Add more blockchain types
@ObjectType({
    description: "Token data"
})
export class BlockchainCollectionData {
    @IsEnum(NFTType)
    @Field(() => GraphQLTypeNFTType, {
        description: "Blockchain token type"
    })
        nftType: NFTType

    @ValidateNested()
    @Type(() => BlockchainNFTData)
    @Field(() => [BlockchainNFTData], {
        description: "Blockchain NFT data"
    })
        nfts: Array<BlockchainNFTData>
}

@ObjectType({
    description: "Blockchain collections response"
})
export class GetBlockchainCollectionsResponse {
    @Field(() => [BlockchainCollectionData], {
        description: "Blockchain collections"
    })
        collections: Array<BlockchainCollectionData>

    @Field(() => Boolean, {
        description: "Cache to prevent abuse call to rpc"
    })
        cached: boolean
}
