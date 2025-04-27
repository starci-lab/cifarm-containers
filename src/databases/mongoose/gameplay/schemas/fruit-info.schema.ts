import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Schema as MongooseSchema, Types } from "mongoose"
import { FruitCurrentState, GraphQLTypeFruitCurrentState } from "../enums"
import { AbstractSchema } from "./abstract"
import { AttributeName } from "@src/blockchain"

@ObjectType({
    description: "The schema for fruit info"
})
@Schema({ timestamps: true, autoCreate: false })
export class FruitInfoSchema extends AbstractSchema {
    @Field(() => Int, {
        description: "The current stage of the fruit"
    })
    @Prop({ type: Number, default: 0 })
        currentStage: number

    @Field(() => Float, {
        description: "The current stage time elapsed of the fruit"
    })
    @Prop({ type: Number, default: 0 })
        currentStageTimeElapsed: number

    @Field(() => Int, {
        description: "The remaining harvest quantity of the fruit"
    })
    @Prop({ type: Number, default: 0 })
        harvestQuantityRemaining: number

    @Field(() => Float, {
        description: "The current fertilizer time of the fruit"
    })
    @Prop({ type: Number, default: 0 })
        currentFertilizerTime: number

    @Field(() => Int, {
        description: "Times the fruit has been harvested"
    })
    @Prop({ type: Number, default: 0 })
        harvestCount: number

    @Field(() => Boolean, {
        description: "Whether the fruit is quality"
    })
    @Prop({ type: Boolean, default: false })
        isQuality: boolean

    @Field(() => GraphQLTypeFruitCurrentState, {
        description: "The current state of the fruit",
        defaultValue: GraphQLTypeFruitCurrentState.Normal
    })
    @Prop({ type: String, enum: FruitCurrentState, default: FruitCurrentState.Normal })
        currentState: FruitCurrentState

    @Field(() => [ID], {
        description: "The thieves of the fruit"
    })
    @Prop({ type: [MongooseSchema.Types.ObjectId], required: false, default: [] })
        thieves: Array<Types.ObjectId>
    
    @Field(() => Float, {
        description: "Where the chance of the fruit to be quality"
    })
    @Prop({ type: Number, default: 0 })
    [AttributeName.QualityYield]: number

    @Field(() => Float, {
        description: "The growth acceleration of the fruit"
    }) 
    @Prop({ type: Number, default: 0 })
    [AttributeName.GrowthAcceleration]: number

    @Field(() => Float, {
        description: "The harvest yield bonus of the fruit"
    })
    @Prop({ type: Number, default: 0 })
    [AttributeName.HarvestYieldBonus]: number

    @Field(() => Float, {
        description: "The disease resistance of the fruit"
    })
    @Prop({
        type: Number,
        default: 0
    })
    [AttributeName.DiseaseResistance]: number

    @Field(() => Int, {
        description: "The desired harvest quantity of the bee house"
    })
    @Prop({ type: Number, default: 0 })
        harvestQuantityDesired: number

    @Field(() => Int, {
        description: "The min harvest quantity of the bee house"
    })
    @Prop({ type: Number, default: 0 })
        harvestQuantityMin: number
}
export const FruitInfoSchemaClass = SchemaFactory.createForClass(FruitInfoSchema)
