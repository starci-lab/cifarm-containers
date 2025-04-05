import { Field, ID, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"
import { Schema as MongooseSchema, Types } from "mongoose"
import { UserSchema } from "./user.schema"
import { USER } from "../constants"

@ObjectType({
    description: "The prepare frozen schema"
})
@Schema({ timestamps: true, collection: "prepare-frozen-nfts" })
export class PrepareFrozenNFTSchema extends AbstractSchema {
    @Field(() => String, {
        description: "The user who owns this prepare frozen"
    })
    @Prop({ type: String, required: true })
        nftAddress: string

    @Field(() => String, {
        description: "The collection address of the prepare frozen",
        nullable: true
    })
    @Prop({ type: String, required: false })
        collectionAddress?: string

    @Field(() => ID, {
        description: "The user who owns this prepare frozen"
    })
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: UserSchema.name, index: true })
    [USER]: UserSchema | Types.ObjectId
}

// Generate Mongoose Schema
export const PrepareFrozenNFTSchemaClass = SchemaFactory.createForClass(PrepareFrozenNFTSchema)
