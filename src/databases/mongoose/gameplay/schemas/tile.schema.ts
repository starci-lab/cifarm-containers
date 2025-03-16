import { Field, Float, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { StaticAbstractSchema } from "./abstract"
import { TileId } from "../enums"

@ObjectType({
    description: "The schema for tile"
})
@Schema({ timestamps: true, collection: "tiles" })
export class TileSchema extends StaticAbstractSchema<TileId> {
    
    @Field(() => Float, { 
        nullable: true,
        description: "The price of the tile"
    })
    @Prop({ type: Number, required: false })
        price?: number

    @Field(() => Boolean, {
        description: "Whether the tile is an NFT"
    })
    @Prop({ type: Boolean, required: true })
        isNft: boolean

    @Field(() => Int, { 
        nullable: true,
        description: "The sell price of the tile"
    })
    @Prop({ type: Number, required: false, default: 0 })
        sellPrice?: number

    @Field(() => Float, {
        description: "The quality product chance stack of the tile"
    })
    @Prop({ type: Number, required: true })
        qualityProductChanceStack: number
    
    @Field(() => Float, {
        description: "The quality product chance limit of the tile"
    })
    @Prop({ type: Number, required: true })
        qualityProductChanceLimit: number

    @Field(() => Boolean, {
        description: "Whether the tile is available in the shop"
    })
    @Prop({ type: Boolean, required: true })
        availableInShop: boolean

    @Field(() => String, {
        description: "The key of the placed item type for this tile"
    })
    @Prop({ type: String, required: true })
        placedItemTypeKey: string

    @Field(() => Int, { 
        nullable: true,
        description: "The level required to unlock this tile"
    })
    @Prop({ type: Number, required: false })
        unlockLevel?: number
}

// Generate Mongoose Schema
export const TileSchemaClass = SchemaFactory.createForClass(TileSchema)
