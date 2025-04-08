import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"
import { BeeHouseCurrentState, FirstCharLowerCaseBeeHouseCurrentState } from "../enums"
import { Types } from "mongoose"
import { Schema as MongooseSchema } from "mongoose"
import { AttributeName } from "@src/blockchain"

@ObjectType({
    description: "The schema for building info"
})
@Schema({ timestamps: true, autoCreate: false })
export class BeeHouseInfoSchema extends AbstractSchema {
    @Field(() => Int, {
        description: "Times the building has been harvested"
    })
    @Prop({ type: Number, default: 0 })
        harvestCount: number

    @Field(() => Float, {
        description: "The current yield time of the bee house"
    })
    @Prop({ type: Number, default: 0 })
        currentYieldTime: number

    @Field(() => FirstCharLowerCaseBeeHouseCurrentState, {
        description: "The current state of the bee house"
    })
    @Prop({ type: String, enum: BeeHouseCurrentState, default: BeeHouseCurrentState.Normal })
        currentState: BeeHouseCurrentState

    @Field(() => [ID], {
        description: "The thieves of the animal"
    })
    @Prop({ type: [MongooseSchema.Types.ObjectId], required: false, default: [] })
        thieves: Array<Types.ObjectId>

    @Field(() => Int, {
        description: "The harvest quantity remaining of the animal"
    })
    @Prop({ type: Number, default: 0 })
        harvestQuantityRemaining: number

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

    @Field(() => Boolean, {
        description: "Whether the bee house is quality",
        nullable: true
    })
    @Prop({ type: Boolean, required: false, default: false })
        isQuality?: boolean

    @Field(() => Float, {
        description: "Where the chance of the fruit to be quality"
    })
    @Prop({ type: Number, default: 0 })
    [AttributeName.QualityYieldChance]: number

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
}

export const BeeHouseInfoSchemaClass = SchemaFactory.createForClass(BeeHouseInfoSchema)
