import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AnimalType, BuildingId } from "../enums"
import { StaticAbstractSchema } from "./abstract"
import { UpgradeSchema, UpgradeSchemaClass } from "./upgrade.schema"

@ObjectType()
@Schema({
    timestamps: true,
    collection: "buildings"
})
export class BuildingSchema extends StaticAbstractSchema<BuildingId> {
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
  @Prop({ type: Number, required: true })
      unlockLevel: number    
  @Field(() => Boolean)
  @Prop({ type: Boolean, required: true })
      upgradable: boolean

  @Field(() => Int)
  @Prop({ type: Number, required: true, default: 5 })
      maxOwnership: number

  @Field(() => [UpgradeSchema])
  @Prop({ type: [UpgradeSchemaClass] })
      upgrades: Array<UpgradeSchema>

    
}

// Generate the Mongoose schema class
export const BuildingSchemaClass = SchemaFactory.createForClass(BuildingSchema)

