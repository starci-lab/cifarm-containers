import { Field, Float, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import {
    AnimalType,
    BuildingId,
    FirstCharLowerCaseAnimalType,
    FirstCharLowerCaseBuildingId
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
    @Field(() => FirstCharLowerCaseBuildingId, {
        description: "The ID of the building"
    })
    @Prop({ type: String, enum: BuildingId, required: true })
        displayId: BuildingId

    @Field(() => Boolean, {
        description: "Whether the building is available in the shop"
    })
    @Prop({ type: Boolean })
        availableInShop: boolean

    @Field(() => FirstCharLowerCaseAnimalType, {
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

    @Field(() => Int, {
        description: "The maximum ownership of the building",
        nullable: true
    })
    @Prop({ type: Number, required: false })
        maxOwnership?: number

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
        description: "Whether the building is upgradable"
    })
    @Prop({ type: Boolean, required: true })
        upgradable: boolean

    @Field(() => [UpgradeSchema], {
        description: "The upgrades of the building",
        nullable: true
    })
    @Prop({ type: [UpgradeSchemaClass], required: false })
        upgrades?: Array<UpgradeSchema>

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
}

// Generate the Mongoose schema class
export const BuildingSchemaClass = SchemaFactory.createForClass(BuildingSchema)
