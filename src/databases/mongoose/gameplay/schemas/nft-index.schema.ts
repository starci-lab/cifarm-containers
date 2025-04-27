import { Field, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"
import { ChainKey, GraphQLTypeChainKey, GraphQLTypeNetwork, Network } from "@src/env"

@ObjectType({
    description: "NFT index schema"
})
@Schema({ timestamps: true, collection: "nft-indexes" })
export class NFTIndexSchema extends AbstractSchema {
    @Field(() => GraphQLTypeNetwork, {
        description: "The blockchain network of the user"
    })
    @Prop({
        type: String,
        required: true,
        enum: Network,
        default: Network.Testnet
    })
        network: Network

    @Field(() => GraphQLTypeChainKey, {
        description: "The blockchain chain key for the NFT item"
    })
    @Prop({
        type: String,
        required: true,
        enum: ChainKey,
        default: ChainKey.Solana
    })
        chainKey: ChainKey

    @Field(() => String, {
        description: "The collection address"
    })
    @Prop({ type: String, required: true })
        collectionAddress: string

    @Field(() => Number, {
        description: "The index of the NFT"
    })
    @Prop({ type: Number, default: 0 })
        index: number
}

export const NFTIndexSchemaClass = SchemaFactory.createForClass(NFTIndexSchema)
