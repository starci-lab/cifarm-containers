import { Field, Float, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument } from "mongoose"
import { ProductType } from "../enums"
import { KeyAbstractSchema } from "./abstract"

// Mongoose document type
export type ProductDocument = HydratedDocument<ProductSchema>;

@ObjectType()
@Schema({ timestamps: true, collection: "products" })
export class ProductSchema extends KeyAbstractSchema {

    @Field(() => Boolean)
    @Prop({ type: Boolean, required: true })
        isQuality: boolean

    @Field(() => Int)
    @Prop({ type: Number, required: true })
        goldAmount: number

    @Field(() => Float)
    @Prop({ type: Number, required: true })
        tokenAmount: number

    @Field(() => String)
    @Prop({ type: String, enum: ProductType, required: true })
        type: ProductType

    @Field(() => String, { nullable: true })
    @Prop({ type: String, required: false })
        cropKey?: string

    @Field(() => String, { nullable: true })
    @Prop({ type: String, required: false })
        animalKey?: string

    @Field(() => String)
    @Prop({ type: String, required: true })
        inventoryTypeId: string
}

// Generate Mongoose Schema
export const ProductSchemaClass = SchemaFactory.createForClass(ProductSchema)
