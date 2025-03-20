import { ObjectType, Field, Int, Float, ID } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"
import { AnimalCurrentState, FirstCharLowerCaseAnimalCurrentState } from "../enums"
import { ANIMAL } from "../constants"
import { AnimalSchema } from "./animal.schema"
import { Schema as MongooseSchema, Types } from "mongoose"

@ObjectType({
    description: "The schema for animal info"
})
@Schema({ timestamps: true, autoCreate: false })
export class AnimalInfoSchema extends AbstractSchema {
    @Field(() => Float, {
        description: "The current growth time of the animal"
    })
    @Prop({ type: Number, default: 0 })
        currentGrowthTime: number

    @Field(() => Float, {
        description: "The current hungry time of the animal"
    })
    @Prop({ type: Number, default: 0 })
        currentHungryTime: number

    @Field(() => Float, {
        description: "The current yield time of the animal"
    })
    @Prop({ type: Number, default: 0 })
        currentYieldTime: number

    @Field(() => Boolean, {
        description: "Whether the animal is an adult"
    })
    @Prop({ type: Boolean, default: false })
        isAdult: boolean

    @Field(() => Boolean, {
        description: "Whether the animal is quality"
    })
    @Prop({ type: Boolean, default: false })
        isQuality: boolean

    @Field(() => Int, {
        description: "Times the animal has been harvested"
    })
    @Prop({ type: Number, default: 0 })
        timesHarvested: number

    @Field(() => ID, {
        description: "The animal ID"
    })
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: AnimalSchema.name })
    [ANIMAL]: AnimalSchema | Types.ObjectId

    @Field(() => FirstCharLowerCaseAnimalCurrentState, {
        description: "The current state of the animal"
    })
    @Prop({ type: String, enum: AnimalCurrentState, default: AnimalCurrentState.Normal })
        currentState: AnimalCurrentState

    @Field(() => [ID], {
        description: "The thieves of the animal"
    })
    @Prop({ type: [MongooseSchema.Types.ObjectId], required: false, default: [] })
        thieves: Array<Types.ObjectId>

    @Field(() => Int, {
        description: "The harvest quantity remaining of the animal",
        nullable: true
    })
    @Prop({ type: Number, required: false, default: 0 })
        harvestQuantityRemaining?: number

    @Field(() => Boolean, {
        description: "Whether the animal is immunized",
        nullable: true
    })
    @Prop({ type: Boolean, default: false })
        immunized: boolean
}
export const AnimalInfoSchemaClass = SchemaFactory.createForClass(AnimalInfoSchema)