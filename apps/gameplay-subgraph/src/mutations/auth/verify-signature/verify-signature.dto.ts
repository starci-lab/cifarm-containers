import { IsOptional, IsUUID, IsEnum, IsJWT } from "class-validator"
import { Network, ChainKey } from "@src/env"
import { SignedMessage } from "@src/blockchain"
import { Field, InputType, ObjectType } from "@nestjs/graphql"

@InputType()    
export class VerifySignatureRequest implements SignedMessage {
    @IsUUID()
    @Field(() => String, { description: "Message to verify signature for" })
        message: string

    @Field(() => String, { description: "Public key to verify signature for" })
        publicKey: string
    
    @Field(() => String, { description: "Signature to verify signature for" })
        signature: string
    
    @Field(() => String, { description: "Username to verify signature for" })
        username: string

    @IsOptional()
    @IsEnum(ChainKey)
    @Field(() => ChainKey, { description: "Chain key to verify signature for", defaultValue: ChainKey.Solana })
        chainKey: ChainKey

    @IsOptional()
    @IsEnum(Network)
    @Field(() => Network, { description: "Network to verify signature for", defaultValue: Network.Testnet })
        network: Network

    @IsOptional()
    @Field(() => String, { description: "Account address to verify signature for", nullable: true })
        accountAddress?: string
}

@ObjectType()
export class VerifySignatureResponse {
    @IsJWT()
    @Field(() => String, { description: "Access token for the user" })
        accessToken: string

    @IsUUID("4")
    @Field(() => String, { description: "Refresh token to get a new access token" })
        refreshToken: string
}
