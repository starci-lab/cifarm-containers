import { Field, Float, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { StaticAbstractSchema } from "./abstract"
import { TileId } from "../enums"

@ObjectType()
@Schema({ timestamps: true, collection: "tiles" })
export class TileSchema extends StaticAbstractSchema<TileId> {
    
    @Field(() => Float, { nullable: true })
    @Prop({ type: Number, required: false })
        price?: number

    @Field(() => Boolean)
    @Prop({ type: Boolean, required: true })
        isNft: boolean

    @Field(() => Int, { nullable: true })
    @Prop({ type: Number, required: false, default: 0 })
        sellPrice?: number

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

    @Field(() => Int, { nullable: true })
    @Prop({ type: Number, required: false })
        unlockLevel?: number
}

// Generate Mongoose Schema
export const TileSchemaClass = SchemaFactory.createForClass(TileSchema)
