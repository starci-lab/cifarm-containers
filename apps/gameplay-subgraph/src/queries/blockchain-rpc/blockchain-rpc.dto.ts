import { InputType, Field, ObjectType, Float, Int } from "@nestjs/graphql"
import { GraphQLTypeNFTCollectionKey, GraphQLTypeTokenKey, NFTCollectionKey, TokenKey } from "@src/databases"
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

    @Field(() => Int, {
        description: "Refresh interval"
    })
        refreshInterval: number
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

    @IsEnum(NFTCollectionKey, { each: true })
    @Field(() => [GraphQLTypeNFTCollectionKey], {
        description: "NFT type"
    })
        nftCollectionKeys: Array<NFTCollectionKey>

    @IsBoolean()
    @Field(() => Boolean, {
        description: "Refresh to prevent abuse call to rpc"
    })
        refresh: boolean
}

@ObjectType({
    description: "NFT attribute"
})
export class NFTAttribute {
    @Field(() => String, {
        description: "Attribute key"
    })
        key: string

    @Field(() => String, {
        description: "Attribute value"
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

    @Field(() => [NFTAttribute], {
        description: "NFT attributes"
    })
        attributes: Array<NFTAttribute>

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

    @Field(() => Boolean, {
        description: "NFT wrapped address"
    })
        wrapped: boolean
}

// TODO: Add more blockchain types
@ObjectType({
    description: "Token data"
})
export class BlockchainCollectionData {
    @IsEnum(NFTCollectionKey)
    @Field(() => GraphQLTypeNFTCollectionKey, {
        description: "Blockchain token type"
    })
        nftCollectionKey: NFTCollectionKey

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

    @Field(() => Int, {
        description: "Refresh interval"
    })
        refreshInterval: number
}
