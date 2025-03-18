import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Schema as MongooseSchema } from "mongoose"
import { FRUIT } from "../constants"
import { FruitCurrentState } from "../enums"
import { AbstractSchema } from "./abstract"
import { FruitSchema } from "./fruit.schema"

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

    @Field(() => FruitCurrentState, {
        description: "The current state of the fruit"
    })
    @Prop({ type: String, enum: FruitCurrentState, default: FruitCurrentState.Normal })
        currentState: FruitCurrentState

    @Field(() => [ID], {
        description: "The thieves of the fruit"
    })
    @Prop({ type: [MongooseSchema.Types.ObjectId], required: false, default: [] })
        thieves: Array<MongooseSchema.Types.ObjectId>

    @Field(() => ID, {
        description: "The fruit ID"
    })
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: FruitSchema.name })
    [FRUIT]: FruitSchema | string
}
export const FruitInfoSchemaClass = SchemaFactory.createForClass(FruitInfoSchema)
