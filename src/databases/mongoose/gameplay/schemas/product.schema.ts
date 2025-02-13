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
    @Field(() => Int)
    @Prop({ type: Number, required: true })
        maxStack: number

    @Field(() => Boolean)
    @Prop({ type: Boolean, required: true })
        isQuality: boolean

    @Field(() => Int)
    @Prop({ type: Number, required: true })
        goldAmount: number

    @Field(() => Float, { nullable: true })
    @Prop({ type: Number, required: false })
        tokenAmount?: number

    @Field(() => String)
    @Prop({ type: String, enum: ProductType, required: true })
        type: ProductType

    @Field(() => String)
    @Prop({ type: String, required: true })
        refKey: string
}

// Generate Mongoose Schema
export const ProductSchemaClass = SchemaFactory.createForClass(ProductSchema)
