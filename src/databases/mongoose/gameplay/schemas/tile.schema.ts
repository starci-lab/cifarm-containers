import { Field, Float, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument } from "mongoose"
import { KeyAbstractSchema } from "./abstract"

// Mongoose document type
export type TileDocument = HydratedDocument<TileSchema>;

@ObjectType()
@Schema({ timestamps: true, collection: "tiles", id: false })
export class TileSchema extends KeyAbstractSchema {
    
    @Field(() => Float, { nullable: true })
    @Prop({ type: Number, required: false })
        price?: number

    @Field(() => Int, { nullable: true })
    @Prop({ type: Number, required: false })
        maxOwnership?: number

    @Field(() => Boolean)
    @Prop({ type: Boolean, required: true })
        isNft: boolean

    @Field(() => Float)
    @Prop({ type: Number, required: true })
        qualityProductChanceStack: number
    
    @Field(() => Float)
    @Prop({ type: Number, required: true })
        qualityProductChanceLimit: number

    @Field(() => Boolean)
    @Prop({ type: Boolean, required: true })
        availableInShop: boolean

    @Field(() => String)
    @Prop({ type: String, required: true })
        placedItemTypeKey: string
}

// Generate Mongoose Schema
export const TileSchemaClass = SchemaFactory.createForClass(TileSchema)
