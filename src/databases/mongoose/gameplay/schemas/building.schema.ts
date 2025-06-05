import { Field, Float, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import {
    AnimalType,
    BuildingId,
    GraphQLTypeAnimalType,
    GraphQLTypeBuildingId,
    BuildingKind,
    GraphQLTypeBuildingKind
} from "../enums"
import { AbstractSchema } from "./abstract"
import { UpgradeSchema, UpgradeSchemaClass } from "./upgrade.schema"

@ObjectType({
    description: "The schema for building"
})
@Schema({
    timestamps: true,
    collection: "buildings"
})
export class BuildingSchema extends AbstractSchema {
    @Field(() => GraphQLTypeBuildingId, {
        description: "The ID of the building"
    })
    @Prop({ type: String, enum: BuildingId, required: true })
        displayId: BuildingId

    @Field(() => Boolean, {
        description: "Whether the building is available in the shop"
    })
    @Prop({ type: Boolean })
        availableInShop: boolean

    @Field(() => GraphQLTypeAnimalType, {
        description: "The type of animal that can be placed in this building",
        nullable: true
    })
    @Prop({ type: String, enum: AnimalType, required: false })
        animalContainedType?: AnimalType

    @Field(() => Int, {
        description: "The maximum upgrade of the building",
        nullable: true
    })
    @Prop({ type: Number, required: false })
        maxUpgrade?: number

    @Field(() => Boolean, {
        description: "Whether the building is unique",
        nullable: true
    })
    @Prop({ type: Boolean, required: false })
        unique: boolean

    @Field(() => Int, {
        description: "The price of the building",
        nullable: true
    })
    @Prop({ type: Number, required: false })
        price?: number

    @Field(() => Int, {
        description: "The unlock level of the building"
    })
    @Prop({ type: Number, required: true })
        unlockLevel: number

    @Field(() => Boolean, {
        description: "Whether the building is upgradeable"
    })
    @Prop({ type: Boolean, required: true })
        upgradeable: boolean

    @Field(() => [UpgradeSchema], {
        description: "The upgrades of the building",
        nullable: true
    })
    @Prop({ type: [UpgradeSchemaClass], required: false })
        upgrades?: Array<UpgradeSchema>

    @Field(() => GraphQLTypeBuildingKind, {
        description: "The kind of building",
    })
    @Prop({ type: String, enum: BuildingKind, default: BuildingKind.Neutral })
        kind: BuildingKind

    @Field(() => Int, {
        description: "Bee house yield time",
        nullable: true
    })
    @Prop({ type: Number, required: false })
        beeHouseYieldTime?: number

    @Field(() => Int, {
        description: "The basic harvest experiences of the bee house",
        nullable: true
    })
    @Prop({ type: Number, required: false })
        beeHouseBasicHarvestExperiences?: number

    @Field(() => Int, {
        description: "The quality harvest experiences of the bee house",
        nullable: true
    })
    @Prop({ type: Number, required: false })
        beeHouseQualityHarvestExperiences?: number

    @Field(() => Float, {
        description: "Base honey yield coefficient of the bee house",
        nullable: true
    })
    @Prop({ type: Number, required: false })
        baseHoneyYieldCoefficient?: number
    
    @Field(() => Boolean, {
        description: "Whether the building is sellable",
        nullable: true
    })
    @Prop({ type: Boolean, required: false })
        sellable?: boolean

    @Field(() => Int, {
        description: "The sell price of the building",
        nullable: true
    })
    @Prop({ type: Number, required: false, default: 0 })
        sellPrice?: number
}

// Generate the Mongoose schema class
export const BuildingSchemaClass = SchemaFactory.createForClass(BuildingSchema)
