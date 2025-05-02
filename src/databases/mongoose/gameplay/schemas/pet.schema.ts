import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"
import { PetId, GraphQLTypePetId, PetType, GraphQLTypePetType } from "../enums"

@ObjectType({
    description: "The pet schema"
})
@Schema({ timestamps: true, collection: "pets" })
export class PetSchema extends AbstractSchema {
    @Field(() => GraphQLTypePetId, {
        description: "The display ID of the pet"
    })
    @Prop({ type: String, enum: PetId, required: true, unique: true })
        displayId: PetId
    @Field(() => Boolean, {
        description: "Whether the pet is available in the shop"
    })
    @Prop({ type: Boolean, required: true, default: false })
        availableInShop: boolean
    @Field(() => Int, { 
        nullable: true,
        description: "The price of the pet"
    })
    @Prop({ type: Number, required: false })
        price?: number
    @Field(() => Int, { 
        nullable: true,
        description: "The sell price of the pet"
    })
    @Prop({ type: Number, required: false, default: 0 })
        sellPrice?: number

    @Field(() => Int, { 
        nullable: true,
        description: "The level required to unlock this pet"
    })
    @Prop({ type: Number, required: false })
        unlockLevel?: number

    @Field(() => GraphQLTypePetType, {
        description: "The type of the pet"
    })
    @Prop({ type: String, enum: PetType, required: true, unique: true })
        type: PetType

    @Field(() => Int, {
        description: "The help success experience of the pet"
    })
    @Prop({ type: Number, min: 0 })
        helpSuccessExperience: number
}

// Generate Mongoose Schema
export const PetSchemaClass = SchemaFactory.createForClass(PetSchema)
