import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity, JoinColumn, OneToOne } from "typeorm"
import { PlacedItemEntity } from "./placed-item.entity"
import { UuidAbstractEntity } from "./abstract"

@ObjectType()
@Entity("tile_info")
export class TileInfoEntity extends UuidAbstractEntity {
    @Field(() => Int)
    @Column({ name: "harvest_count", type: "int", default: 0 })
        harvestCount: number

    @Field(() => String)
    @Column({ name: "placed_item_id", type: "uuid" })
        placedItemId: string

    @Field(() => PlacedItemEntity)
    @OneToOne(() => PlacedItemEntity, (placedItem) => placedItem.seedGrowthInfo, {
        onDelete: "CASCADE"
    })
    @JoinColumn({
        name: "placed_item_id",
        referencedColumnName: "id"
    })
        placedItem?: PlacedItemEntity
}
