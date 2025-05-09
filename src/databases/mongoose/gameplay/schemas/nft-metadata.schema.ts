import { Field, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"
import { ChainKey, GraphQLTypeChainKey, GraphQLTypeNetwork } from "@src/env"
import { Network } from "@src/env"

@ObjectType({
    description: "The nft metadata"
})
@Schema({ timestamps: true, collection: "nft-metadata" })
export class NFTMetadataSchema extends AbstractSchema {
    @Field(() => String, {
        description: "The nft address"
    })
    @Prop({ type: String, required: true })
        nftAddress: string

    @Field(() => String, {
        description: "The collection address of the nft",
        nullable: true
    })
    @Prop({ type: String, required: false })
        collectionAddress?: string

    @Field(() => GraphQLTypeNetwork, {
        description: "The network of the nft"
    })
    @Prop({ type: String, enum: Network, required: true })
        network: Network

    @Field(() => Boolean, {
        description: "Whether the nft has been validated"
    })
    @Prop({ type: Boolean, required: true })
        validated: boolean

    @Field(() => String, {
        description: "The name of the nft"
    })
    @Prop({ type: String, required: true })
        nftName: string

    @Field(() => GraphQLTypeChainKey, {
        description: "The chain key of the nft"
    })
    @Prop({ type: String, enum: ChainKey, required: true })
        chainKey: ChainKey
}

// Generate Mongoose Schema
export const NFTMetadataSchemaClass = SchemaFactory.createForClass(NFTMetadataSchema)
