import { Field, ID, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"
import { Schema as MongooseSchema, Types } from "mongoose"
import { UserSchema } from "./user.schema"
import { USER } from "../constants"

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

    @Field(() => ID, {
        description: "The user who owns this nft"
    })
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: UserSchema.name, index: true })
    [USER]: UserSchema | Types.ObjectId

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
}

// Generate Mongoose Schema
export const NFTMetadataSchemaClass = SchemaFactory.createForClass(NFTMetadataSchema)
