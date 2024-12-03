import { Field, ObjectType } from "@nestjs/graphql"
import { Column, Entity, JoinColumn, OneToMany, OneToOne, Relation } from "typeorm"
import { StringAbstractEntity } from "./abstract"
import { PlacedItemType } from "./enums"
import type { AnimalEntity } from "./animal.entity"
import type { BuildingEntity } from "./building.entity"
import type { TileEntity } from "./tile.entity"
import type { PlacedItemEntity } from "./placed-item.entity"

@ObjectType()
@Entity("placed_item_types")
export class PlacedItemTypeEntity extends StringAbstractEntity {
    @Field(() => String)
    @Column({ name: "type", type: "enum", enum: PlacedItemType })
        type: PlacedItemType

    @Field(() => String, { nullable: true })
    @Column({ name: "tile_id", nullable: true })
        tileId: string

    @OneToOne("TileEntity", { onDelete: "CASCADE", cascade: true })
    @JoinColumn({
        name: "tile_id",
        referencedColumnName: "id"
    })
        tile: Relation<TileEntity>

    @OneToOne("BuildingEntity", { onDelete: "CASCADE", cascade: true })
    @JoinColumn({
        name: "building_id",
        referencedColumnName: "id"
    })
        building: Relation<BuildingEntity>

    @Field(() => String, { nullable: true })
    @Column({ name: "animal_id", nullable: true })
        animalId: string

    @OneToOne("AnimalEntity", { onDelete: "CASCADE", cascade: true })
    @JoinColumn({
        name: "animal_id",
        referencedColumnName: "id"
    })
        animal: Relation<AnimalEntity>

    @OneToMany("PlacedItemEntity", "placedItemType", {
        cascade: ["insert", "update"]
    })
        placedItems?: Relation<Array<PlacedItemEntity>>
}
