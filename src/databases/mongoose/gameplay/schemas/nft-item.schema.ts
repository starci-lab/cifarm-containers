import { Field, ID, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"
import { ChainKey, GraphQLTypeChainKey, GraphQLTypeNetwork, Network } from "@src/env"
import { UserSchema } from "./user.schema"
import { USER } from "../constants"
import { Types } from "mongoose"
import { Schema as MongooseSchema } from "mongoose"

@ObjectType({
    description: "NFT item schema"
})
@Schema({ timestamps: true, collection: "nft_items" })
export class NFTItemSchema extends AbstractSchema {
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

    @Field(() => JSON, {
        description: "Traits of the NFT item"
    })
    @Prop({ type: Object, required: true })
        traits: object

    @Field(() => String, {
        description: "The nft address"
    })
    @Prop({ type: String, required: true })
        nftAddress: string

    @Field(() => String, {
        description: "The collection address"
    })
    @Prop({ type: String, required: true })
        collectionAddress: string

    @Field(() => ID, {
        description: "The user who owns this inventory item"
    })
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: UserSchema.name, index: true })
    [USER]: UserSchema | Types.ObjectId
}

export const NFTItemSchemaClass = SchemaFactory.createForClass(NFTItemSchema)
