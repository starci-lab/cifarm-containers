import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument } from "mongoose"
import { AnimalType } from "../enums"
import { KeyAbstractSchema } from "./abstract"

// This creates the Animal document type for Mongoose
export type BuildingDocument = HydratedDocument<BuildingSchema>;

@ObjectType()
@Schema({
    timestamps: true,
    collection: "buildings",
    _id: false
})
export class BuildingSchema extends KeyAbstractSchema {
  @Field(() => Boolean)
  @Prop({ type: Boolean })
      availableInShop: boolean

  @Field(() => String, { nullable: true })
  @Prop({ type: String, enum: AnimalType, required: false })
      type?: AnimalType

  @Field(() => Int)
  @Prop({ type: Number })
      maxUpgrade: number

  @Field(() => Int, { nullable: true })
  @Prop({ type: Number, required: false })
      price?: number

  @Field(() => Int)
  @Prop({ type: Number })
      unlockLevel: number
    
  @Field(() => Boolean)
  @Prop({ type: Boolean })
      upgradable: boolean

  @Field(() => [Upgrade])
  @Prop({ type: Array<Upgrade> })
      upgrades?: Array<Upgrade>
}

@ObjectType()
export class Upgrade {
    @Field(() => Int, { nullable: true })
    @Prop({ type: Number, required: false })
        upgradePrice?: number
    
    @Field(() => Int)
    @Prop({ type: Number })
        capacity: number
    
    @Field(() => Int)
    @Prop({ type: Number })
        upgradeLevel: number
}

// Generate the Mongoose schema class
export const BuildingSchemaClass = SchemaFactory.createForClass(BuildingSchema)

