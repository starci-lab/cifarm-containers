import { Field, ID, Int, ObjectType } from "@nestjs/graphql"
import { Prop } from "@nestjs/mongoose"
import { Document } from "mongoose"

@ObjectType({
    isAbstract: true,
    description: "The abstract schema for all objects"
})
export abstract class AbstractSchema extends Document {
    // field to use graphql
    @Field(() => ID, {
        description: "The ID of the object"
    })
        id: string

    @Prop()
    @Field(() => Date, {
        description: "The date the object was created"

    })
        createdAt: Date

    @Prop()
    @Field(() => Date, {
        description: "The date the object was updated"
    })
        updatedAt: Date
}

@ObjectType({
    isAbstract: true,
    description: "The abstract schema for all plants"
})
export class AbstractPlantSchema extends AbstractSchema {
    @Field(() => Int, {
        description: "The growth stage duration of the plant"
    })
    @Prop({ type: Number, required: true })
        growthStageDuration: number

    @Field(() => Int, {
        description: "The price of the plant"
    })
    @Prop({ type: Number, required: true })
        price: number

    @Field(() => Int, {
        description: "The unlock level of the plant"
    })
    @Prop({ type: Number, required: true, min: 1 })
        unlockLevel: number

    @Field(() => Boolean, {
        description: "Whether the plant is available in the shop"
    })
    @Prop({ type: Boolean, required: true })
        availableInShop: boolean

    @Field(() => Int, {
        description: "The minimum harvest quantity of the plant"
    })
    @Prop({ type: Number, required: true })
        minHarvestQuantity: number

    @Field(() => Int, {
        description: "The maximum harvest quantity of the plant"
    })
    @Prop({ type: Number, required: true })
        maxHarvestQuantity: number

    @Field(() => Int, {
        description: "The basic harvest experiences of the plant"
    })
    @Prop({ type: Number, required: true })
        basicHarvestExperiences: number

    @Field(() => Int, {
        description: "The quality harvest experiences of the plant"
    })
    @Prop({ type: Number, required: true })
        qualityHarvestExperiences: number
}