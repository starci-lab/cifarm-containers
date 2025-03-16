import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { StaticAbstractSchema } from "./abstract"
import { PetId } from "../enums"

@ObjectType({
    description: "The schema for pet"
})
@Schema({ timestamps: true, collection: "pets" })
export class PetSchema extends StaticAbstractSchema<PetId> {
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
}

// Generate Mongoose Schema
export const PetSchemaClass = SchemaFactory.createForClass(PetSchema)
