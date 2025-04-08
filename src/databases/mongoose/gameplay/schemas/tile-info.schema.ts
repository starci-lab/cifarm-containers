import { ObjectType, Field, Int, Float } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"
import { AttributeName } from "@src/blockchain/nft/solana/solana-metaplex.service"

@ObjectType({
    description: "The schema for tile information"
})
@Schema({ timestamps: true, autoCreate: false })
export class TileInfoSchema extends AbstractSchema {
    @Field(() => Int, {
        description: "Times the tile has been harvested"
    })
    @Prop({ type: Number, default: 0 })
        harvestCount: number
    @Field(() => Float, {
        description: "Where the chance of the tile to be quality"
    })
    @Prop({ type: Number, default: 0 })
    [AttributeName.QualityYieldChance]: number

    @Field(() => Float, {
        description: "The growth acceleration of the tile"
    })
    @Prop({ type: Number, default: 0 })
    [AttributeName.GrowthAcceleration]: number

    @Field(() => Float, {
        description: "The harvest yield bonus of the tile"
    })
    @Prop({ type: Number, default: 0 })
    [AttributeName.HarvestYieldBonus]: number

    @Field(() => Float, {
        description: "The disease resistance of the tile"
    })
    @Prop({
        type: Number,
        default: 0
    })
    [AttributeName.DiseaseResistance]: number
}

export const TileInfoSchemaClass = SchemaFactory.createForClass(TileInfoSchema)
