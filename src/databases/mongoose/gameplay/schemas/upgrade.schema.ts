import { ObjectType, Field, Int, Float } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"

@ObjectType({
    description: "The schema for upgrades"
})
@Schema({
    timestamps: true,
    autoCreate: false 
})
export class UpgradeSchema extends AbstractSchema {
    @Field(() => Int, { 
        nullable: true,
        description: "The price to upgrade to the next level"
    })
    @Prop({ type: Number, required: false })
        upgradePrice?: number
    
    @Field(() => Int, {
        description: "The capacity provided by this upgrade level",
        nullable: true
    })
    @Prop({ type: Number, required: false })
        capacity?: number
    
    @Field(() => Int, {
        description: "The current upgrade level"
    })
    @Prop({ type: Number, required: true })
        upgradeLevel: number

    @Field(() => Float, {
        nullable: true,
        description: "The honey multiplier of this upgrade"
    })
    @Prop({ type: Number, required: false })
        honeyMultiplier?: number
}

// Generate Mongoose Schema
export const UpgradeSchemaClass = SchemaFactory.createForClass(UpgradeSchema)
