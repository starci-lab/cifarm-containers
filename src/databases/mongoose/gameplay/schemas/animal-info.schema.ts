import { ObjectType, Field, Int, Float } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"
import { AnimalCurrentState } from "../enums"

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

    @Field(() => String)
    @Prop({ type: String, enum: AnimalCurrentState, default: AnimalCurrentState.Normal })
        currentState: AnimalCurrentState

    @Field(() => Int, { nullable: true })
    @Prop({ type: Number, required: false })
        harvestQuantityRemaining?: number

    @Field(() => Boolean)
    @Prop({ type: Boolean, default: false })
        immunized: boolean
}
export const AnimalInfoSchemaClass = SchemaFactory.createForClass(AnimalInfoSchema)