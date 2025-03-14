import { Injectable, OnModuleInit } from "@nestjs/common"
import {
    AnimalSchema,
    BuildingSchema,
    CropSchema,
    DefaultInfo,
    InjectMongoose,
    KeyValueRecord,
    PlacedItemTypeSchema,
    SystemId,
    SystemSchema
} from "@src/databases"
import { Connection } from "mongoose"

@Injectable()
export class StaticService implements OnModuleInit {
    public defaultInfo: DefaultInfo
    public placedItemTypes: Array<PlacedItemTypeSchema>
    public animals: Array<AnimalSchema>
    public crops: Array<CropSchema>
    public buildings: Array<BuildingSchema>

    constructor(@InjectMongoose() private readonly connection: Connection) {}

    async onModuleInit() {
        const { value } = await this.connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<DefaultInfo>>(SystemId.DefaultInfo)
        this.defaultInfo = value

        this.placedItemTypes = await this.connection
            .model<PlacedItemTypeSchema>(PlacedItemTypeSchema.name)
            .find()

        this.animals = await this.connection
            .model<AnimalSchema>(AnimalSchema.name)
            .find()

        this.crops = await this.connection
            .model<CropSchema>(CropSchema.name)
            .find()
    }
}
