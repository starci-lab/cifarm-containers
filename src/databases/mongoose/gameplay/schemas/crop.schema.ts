import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { StaticAbstractSchema } from "./abstract"

@ObjectType()
@Schema({
    timestamps: true,
    collection: "crops",
})
export class CropSchema extends StaticAbstractSchema {
    @Field(() => Int)
    @Prop({ type: Number, required: true })
        growthStageDuration: number

    @Field(() => Int)
    @Prop({ type: Number, required: true })
        growthStages: number

    @Field(() => Int)
    @Prop({ type: Number, required: true })
        price: number

    @Field(() => Boolean)
    @Prop({ type: Boolean, required: true })
        premium: boolean

    @Field(() => Int)
    @Prop({ type: Number, required: true, default: 1 })
        perennialCount: number

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
        premiumHarvestExperiences: number
}

export const CropSchemaClass = SchemaFactory.createForClass(CropSchema)
