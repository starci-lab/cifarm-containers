import { Field, ObjectType } from "@nestjs/graphql"
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from "typeorm"
import { ReadableAbstractEntity } from "./abstract"
import { AnimalEntity } from "./animal.entity"
import { BuildingEntity } from "./building.entity"
import { PlacedItemType } from "./enums"
import { TileEntity } from "./tile.entity"
import { PlacedItemEntity } from "./placed-item.entity"

@ObjectType()
@Entity("placed_item_types")
export class PlacedItemTypeEntity extends ReadableAbstractEntity {
    @Field(() => String)
    @Column({ name: "type", type: "enum", enum: PlacedItemType })
        type: PlacedItemType

    @OneToOne(() => TileEntity, { onDelete: "CASCADE", eager: true, cascade: true })
    @JoinColumn({
        name: "tile_id",
        referencedColumnName: "id"
    })
        tile: TileEntity

    @OneToOne(() => BuildingEntity, { onDelete: "CASCADE", eager: true, cascade: true })
    @JoinColumn({
        name: "building_id",
        referencedColumnName: "id"
    })
        building: BuildingEntity

    @OneToOne(() => AnimalEntity, { onDelete: "CASCADE", eager: true, cascade: true })
    @JoinColumn({
        name: "animal_id",
        referencedColumnName: "id"
    })
        animal: AnimalEntity

    @Field(() => [PlacedItemEntity], { nullable: true })
    @OneToMany(() => PlacedItemEntity, (placedItem) => placedItem.placedItemType, {
        cascade: ["insert", "update"]
    })
        placedItems?: Array<PlacedItemEntity>
}
