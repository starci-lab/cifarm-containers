import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { FruitId } from "../enums"
import { StaticAbstractSchema } from "./abstract"

@ObjectType()
@Schema({
    timestamps: true,
    collection: "fruits",
})
export class FruitSchema extends StaticAbstractSchema<FruitId> {
    @Field(() => Int)
    @Prop({ type: Number, required: true })
        growthStageDuration: number

    @Field(() => Int)
    @Prop({ type: Number, required: true })
        growthStages: number

    @Field(() => Int)
    @Prop({ type: Number, required: true })
        price: number

    @Field(() => Int)
    @Prop({ type: Number, required: true, min: 1 })
        unlockLevel: number

    @Field(() => Int)
    @Prop({ type: Number, required: true })
        nextGrowthStageAfterHarvest: number

    @Field(() => Boolean)
    @Prop({ type: Boolean, required: true })
        availableInShop: boolean

    @Field(() => Int)
    @Prop({ type: Number, required: true })
        minHarvestQuantity: number

    @Field(() => Int)
    @Prop({ type: Number, required: true })
        maxHarvestQuantity: number

    @Field(() => Int)
    @Prop({ type: Number, required: true })
        basicHarvestExperiences: number

    @Field(() => Int)
    @Prop({ type: Number, required: true })
        qualityHarvestExperiences: number
}

export const FruitSchemaClass = SchemaFactory.createForClass(FruitSchema)
