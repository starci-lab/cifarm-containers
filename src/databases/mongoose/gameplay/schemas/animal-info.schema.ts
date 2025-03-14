import { ObjectType, Field, Int, Float, ID } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"
import { AnimalCurrentState } from "../enums"
import { ANIMAL } from "../constants"
import { AnimalSchema } from "./animal.schema"
import { Schema as MongooseSchema } from "mongoose"

@ObjectType()
@Schema({ timestamps: true, autoCreate: false })
export class AnimalInfoSchema extends AbstractSchema {
    @Field(() => Float)
    @Prop({ type: Number, default: 0 })
        currentGrowthTime: number

    @Field(() => Float)
    @Prop({ type: Number, default: 0 })
        currentHungryTime: number

    @Field(() => Float)
    @Prop({ type: Number, default: 0 })
        currentYieldTime: number

    @Field(() => Boolean)
    @Prop({ type: Boolean, default: false })
        isAdult: boolean

    @Field(() => Boolean)
    @Prop({ type: Boolean, default: false })
        isQuality: boolean

    @Field(() => Int)
    @Prop({ type: Number, default: 0 })
        yieldCount: number

    @Field(() => ID)
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: AnimalSchema.name })
    [ANIMAL]: AnimalSchema | string

    @Field(() => String)
    @Prop({ type: String, enum: AnimalCurrentState, default: AnimalCurrentState.Normal })
        currentState: AnimalCurrentState

    @Field(() => [ID])
    @Prop({ type: [MongooseSchema.Types.ObjectId], required: false, default: [] })
        thieves: Array<MongooseSchema.Types.ObjectId>

    @Field(() => Int, { nullable: true })
    @Prop({ type: Number, required: false, default: 0 })
        harvestQuantityRemaining?: number

    @Field(() => Boolean)
    @Prop({ type: Boolean, default: false })
        immunized: boolean
}
export const AnimalInfoSchemaClass = SchemaFactory.createForClass(AnimalInfoSchema)