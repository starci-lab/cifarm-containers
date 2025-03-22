import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Schema as MongooseSchema, Types } from "mongoose"
import { FruitCurrentState, FirstCharLowerCaseFruitCurrentState } from "../enums"
import { AbstractSchema } from "./abstract"

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
        timesHarvested: number

    @Field(() => Boolean, {
        description: "Whether the fruit is quality"
    })
    @Prop({ type: Boolean, default: false })
        isQuality: boolean

    @Field(() => FirstCharLowerCaseFruitCurrentState, {
        description: "The current state of the fruit",
        defaultValue: FirstCharLowerCaseFruitCurrentState.Normal
    })
    @Prop({ type: String, enum: FruitCurrentState, default: FruitCurrentState.Normal })
        currentState: FruitCurrentState

    @Field(() => [ID], {
        description: "The thieves of the fruit"
    })
    @Prop({ type: [MongooseSchema.Types.ObjectId], required: false, default: [] })
        thieves: Array<Types.ObjectId>
}
export const FruitInfoSchemaClass = SchemaFactory.createForClass(FruitInfoSchema)
