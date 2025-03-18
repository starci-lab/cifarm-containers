import { Field, Float, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"
import { TileId, LowerCaseTileId } from "../enums"

@ObjectType({
    description: "The tile schema"
})
@Schema({ timestamps: true, collection: "tiles" })
export class TileSchema extends AbstractSchema {
    @Field(() => LowerCaseTileId, {
        description: "The display ID of the tile"
    })
    @Prop({ type: String, enum: TileId, required: true, unique: true })
        displayId: TileId

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
