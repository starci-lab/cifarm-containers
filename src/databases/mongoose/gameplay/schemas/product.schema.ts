import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { ProductId, ProductType } from "../enums"
import { StaticAbstractSchema } from "./abstract"
import { Schema as MongooseSchema } from "mongoose"
import { CropSchema } from "./crop.schema"
import { AnimalSchema } from "./animal.schema"
import { FruitSchema } from "./fruit.schema"

@ObjectType({
    description: "The schema for products that can be harvested or produced"
})
@Schema({ timestamps: true, collection: "products" })
export class ProductSchema extends StaticAbstractSchema<ProductId> {
    @Field(() => Int, {
        description: "The maximum stack size of the product"
    })
    @Prop({ type: Number, required: true })
        maxStack: number

    @Field(() => Boolean, {
        description: "Whether the product is a quality product"
    })
    @Prop({ type: Boolean, required: true })
        isQuality: boolean

    @Field(() => Int, {
        description: "The amount of gold the product is worth"
    })
    @Prop({ type: Number, required: true })
        goldAmount: number

    @Field(() => Float, { 
        nullable: true,
        description: "The amount of tokens the product is worth, if applicable"
    })
    @Prop({ type: Number, required: false })
        tokenAmount?: number

    @Field(() => String, {
        description: "The type of product"
    })
    @Prop({ type: String, enum: ProductType, required: true })
        type: ProductType

    @Field(() => ID, { 
        nullable: true,
        description: "The crop associated with this product, if applicable"
    })
    @Prop({ type: MongooseSchema.Types.ObjectId, required: false, ref: CropSchema.name })
        crop: CropSchema | string
        
    @Field(() => ID, { 
        nullable: true,
        description: "The animal associated with this product, if applicable"
    })
    @Prop({ type: MongooseSchema.Types.ObjectId, required: false, ref: AnimalSchema.name })
        animal: AnimalSchema | string

    @Field(() => ID, { 
        nullable: true,
        description: "The fruit associated with this product, if applicable"
    })
    @Prop({ type: MongooseSchema.Types.ObjectId, required: false, ref: FruitSchema.name })
        fruit: FruitSchema | string
}

// Generate Mongoose Schema
export const ProductSchemaClass = SchemaFactory.createForClass(ProductSchema)
