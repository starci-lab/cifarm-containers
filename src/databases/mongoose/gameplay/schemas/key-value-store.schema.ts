import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { StaticAbstractSchema } from "./abstract"
import { KeyValueStoreId } from "../enums"

@Schema({
    timestamps: true,
    collection: "key-value-stores",
})
export class KeyValueStoreSchema extends StaticAbstractSchema<KeyValueStoreId> {
    @Prop({ type: Object, required: true })
        value: object
}

// Generate Mongoose Schema
export const KeyValueStoreSchemaClass = SchemaFactory.createForClass(KeyValueStoreSchema)

// Class for KeyValueStoreSchema
export class AnimalGrowthLastSchedule {
    date: Date
}
export class CropGrowthLastSchedule {
    date: Date
}
//fruit
export class FruitGrowthLastSchedule {
    date: Date
}
export class EnergyRegenerationLastSchedule {
    date: Date
}