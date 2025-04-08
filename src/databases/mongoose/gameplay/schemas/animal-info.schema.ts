import { ObjectType, Field, Int, Float, ID } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"
import { AnimalCurrentState, FirstCharLowerCaseAnimalCurrentState } from "../enums"
import { Schema as MongooseSchema, Types } from "mongoose"
import { AttributeName } from "@src/blockchain/nft/solana/solana-metaplex.service"

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
        harvestCount: number

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
        description: "The harvest quantity remaining of the animal"
    })
    @Prop({ type: Number, default: 0 })
        harvestQuantityRemaining: number

    @Field(() => Boolean, {
        description: "Whether the animal is immunized",
        nullable: true
    })
    @Prop({ type: Boolean, default: false })
        immunized: boolean

    @Field(() => Float, {
        description: "Where the chance of the animal to be quality"
    })
    @Prop({ type: Number, default: 0 })
    [AttributeName.QualityYieldChance]: number

    @Field(() => Float, {
        description: "The growth acceleration of the animal"
    })
    @Prop({ type: Number, default: 0 })
    [AttributeName.GrowthAcceleration]: number

    @Field(() => Float, {
        description: "The harvest yield bonus of the animal"
    })
    @Prop({ type: Number, default: 0 })
    [AttributeName.HarvestYieldBonus]: number

    @Field(() => Float, {
        description: "The disease resistance of the animal"
    })
    @Prop({
        type: Number,
        default: 0
    })
    [AttributeName.DiseaseResistance]: number
}
export const AnimalInfoSchemaClass = SchemaFactory.createForClass(AnimalInfoSchema)
