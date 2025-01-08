import { Field, ObjectType } from "@nestjs/graphql"
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from "typeorm"
import { StringAbstractEntity } from "./abstract"
import { AnimalEntity } from "./animal.entity"
import { BuildingEntity } from "./building.entity"
import { PlacedItemType } from "../enums"
import { TileEntity } from "./tile.entity"
import { PlacedItemEntity } from "./placed-item.entity"

@ObjectType()
@Entity("placed_item_types")
export class PlacedItemTypeEntity extends StringAbstractEntity {
    @Field(() => String)
    @Column({ name: "type", type: "enum", enum: PlacedItemType })
        type: PlacedItemType

    @Field(() => String, { nullable: true })
    @Column({ name: "tile_id", nullable: true })
        tileId: string

    @OneToOne(() => TileEntity, { onDelete: "CASCADE", cascade: true })
    @JoinColumn({
        name: "tile_id",
        referencedColumnName: "id"
    })
        tile: TileEntity

    @OneToOne(() => BuildingEntity, { onDelete: "CASCADE", cascade: true })
    @JoinColumn({
        name: "building_id",
        referencedColumnName: "id"
    })
        building: BuildingEntity

    @Field(() => String, { nullable: true })
    @Column({ name: "animal_id", nullable: true })
        animalId: string

    @OneToOne(() => AnimalEntity, { onDelete: "CASCADE", cascade: true })
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
