import { IsEnum, IsInt, IsOptional, IsUUID } from "class-validator"
import { Network, ChainKey } from "@src/env"
import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { ResponseLike, IResponseLike } from "@src/graphql"

@InputType()
export class GenerateSignatureRequest {
    @IsEnum(ChainKey)
    @Field(() => String, {
        defaultValue: ChainKey.Solana,
        description: "Chain key to generate signature for"
    })
        chainKey: ChainKey

    @IsInt()
    @Field(() => Number, {
        defaultValue: 0,
        description: "Account number to generate signature for"
    })
        accountNumber: number

    @IsEnum(Network)
    @Field(() => String, {
        defaultValue: Network.Testnet,
        description: "Network to generate signature for"
    })
        network: Network
}

@ObjectType()
export class GenerateSignatureResponseData {
    @IsOptional()
    @IsEnum(ChainKey)
    @Field(() => String, {
        defaultValue: ChainKey.Solana,
        description: "Chain key to generate signature for"
    })
        chainKey: ChainKey

    @IsUUID("4")
    @Field(() => String, { description: "Message to generate signature for" })
        message: string

    @Field(() => String, { description: "Public key to generate signature for" })
        publicKey: string

    @Field(() => String, { description: "Signature to generate signature for" })
        signature: string

    @IsOptional()
    @IsEnum(Network)
    @Field(() => String, {
        defaultValue: Network.Testnet,
        description: "Network to generate signature for"
    })
        network: Network

    @Field(() => String, { description: "Account address to generate signature for" })
        accountAddress: string
}

@ObjectType()
export class GenerateSignatureResponse
    extends ResponseLike
    implements IResponseLike<GenerateSignatureResponseData>
{
    @Field(() => GenerateSignatureResponseData)
        data: GenerateSignatureResponseData
}
