import { ObjectType, Field } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"
import { TutorialStep } from "../enums"
@ObjectType({
    description: "The schema for tutorials"
})
@Schema({
    timestamps: true,
    autoCreate: false 
})
export class TutorialSchema extends AbstractSchema {
    @Field(() => Boolean, { 
        description: "The tutorial start"
    })
    @Prop({ type: Boolean, default: false })
    [TutorialStep.Start]: boolean
    
    @Field(() => Boolean, {
        description: "The tutorial open shop modal",
        defaultValue: false
    })
    @Prop({ type: Boolean, default: false })
    [TutorialStep.OpenShopModal]: boolean
    
    @Field(() => Boolean, {
        description: "The tutorial open inventory modal",
        defaultValue: false
    })
    @Prop({ type: Boolean, default: false })
    [TutorialStep.OpenInventoryModal]: boolean

    @Field(() => Boolean, {
        description: "The tutorial plant"
    })
    @Prop({ type: Boolean, default: false })
    [TutorialStep.Plant]: boolean

    @Field(() => Boolean, {
        description: "The tutorial open neighbors modal"
    })
    @Prop({ type: Boolean, default: false })
    [TutorialStep.OpenNeighborsModal]: boolean

    @Field(() => Boolean, {
        description: "The tutorial at neighbor"
    })
    @Prop({ type: Boolean, default: false })
    [TutorialStep.AtNeighbor]: boolean    
}

// Generate Mongoose Schema
export const TutorialSchemaClass = SchemaFactory.createForClass(TutorialSchema)
