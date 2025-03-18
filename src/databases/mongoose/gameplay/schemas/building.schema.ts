import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AnimalType, BuildingId } from "../enums"
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
    @Field(() => BuildingId, {
        description: "The ID of the building"
    })
    @Prop({ type: String, enum: BuildingId, required: true })
        displayId: BuildingId

    @Field(() => Boolean, {
        description: "Whether the building is available in the shop"
    })
    @Prop({ type: Boolean })
        availableInShop: boolean

    @Field(() => AnimalType, {
        description: "The type of animal that can be placed in this building",
        nullable: true
    })
    @Prop({ type: String, enum: AnimalType, required: false })
        animalType?: AnimalType

    @Field(() => Int, {
        description: "The maximum upgrade of the building"
    })
    @Prop({ type: Number })
        maxUpgrade: number

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
        description: "The upgrades of the building"
    })
    @Prop({ type: [UpgradeSchemaClass] })
        upgrades: Array<UpgradeSchema>
}

// Generate the Mongoose schema class
export const BuildingSchemaClass = SchemaFactory.createForClass(BuildingSchema)
