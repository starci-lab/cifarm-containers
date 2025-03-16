import { ObjectType, Field, Int } from "@nestjs/graphql"
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
        description: "The capacity provided by this upgrade level"
    })
    @Prop({ type: Number, required: true })
        capacity: number
    
    @Field(() => Int, {
        description: "The current upgrade level"
    })
    @Prop({ type: Number, required: true })
        upgradeLevel: number

    @Field(() => Int, { 
        nullable: true,
        description: "The sell price of the upgrade"
    })
    @Prop({ type: Number, required: false, default: 0 })
        sellPrice?: number
}

// Generate Mongoose Schema
export const UpgradeSchemaClass = SchemaFactory.createForClass(UpgradeSchema)
