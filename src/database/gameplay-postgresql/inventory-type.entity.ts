import { Field, ObjectType } from "@nestjs/graphql"
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from "typeorm"
import { StringAbstractEntity } from "./abstract"
import { AnimalEntity } from "./animal.entity"
import { CropEntity } from "./crop.entity"
import { InventoryType } from "./enums"
import { InventoryEntity } from "./inventory.entity"
import { ProductEntity } from "./product.entity"
import { SupplyEntity } from "./supply.entity"
import { TileEntity } from "./tile.entity"

@ObjectType()
@Entity("inventory_types")
export class InventoryTypeEntity extends StringAbstractEntity {
    @Field(() => String)
    @Column({ name: "type", type: "enum", enum: InventoryType })
        type: InventoryType

    @Field(() => Boolean, { defaultValue: false })
    @Column({ name: "placeable", type: "boolean", default: false })
        placeable: boolean

    @Field(() => Boolean, { defaultValue: false })
    @Column({ name: "deliverable", type: "boolean", default: false })
        deliverable: boolean

    @Field(() => Boolean, { defaultValue: false })
    @Column({ name: "as_tool", type: "boolean", default: false })
        asTool: boolean

    @Field(() => Number, { defaultValue: 16 })
    @Column({ name: "max_stack", type: "int", default: 16 })
        maxStack: number

    @Field(() => String, { nullable: true })
    @Column({ name: "crop_id", nullable: true })
        cropId: string

    @OneToOne(() => CropEntity, { onDelete: "CASCADE", cascade: true })
    @JoinColumn({
        name: "crop_id",
        referencedColumnName: "id"
    })
        crop: CropEntity

    @Field(() => String, { nullable: true })
    @Column({ name: "animal_id", nullable: true })
        animalId: string

    @OneToOne(() => AnimalEntity, { onDelete: "CASCADE", cascade: true })
    @JoinColumn({
        name: "animal_id",
        referencedColumnName: "id"
    })
        animal: AnimalEntity

    @Field(() => String, { nullable: true })
    @Column({ name: "supply_id", nullable: true })
        supplyId: string

    @OneToOne(() => SupplyEntity, { onDelete: "CASCADE", cascade: true })
    @JoinColumn({
        name: "supply_id",
        referencedColumnName: "id"
    })
        supply: SupplyEntity

    @Field(() => String, { nullable: true })
    @Column({ name: "product_id", nullable: true })
        productId: string

    @OneToOne(() => ProductEntity, { onDelete: "CASCADE", cascade: true })
    @JoinColumn({
        name: "product_id",
        referencedColumnName: "id"
    })
        product: ProductEntity

    @Field(() => String, { nullable: true })
    @Column({ name: "tile_id", nullable: true })
        tileId: string

    @OneToOne(() => TileEntity, { onDelete: "CASCADE", cascade: true })
    @JoinColumn({
        name: "tile_id",
        referencedColumnName: "id"
    })
        tile: TileEntity

    @Field(() => [InventoryEntity], { nullable: true })
    @OneToMany(() => InventoryEntity, (inventory) => inventory.inventoryType, {
        cascade: ["insert", "update", "remove"]
    })
        inventories?: Array<InventoryEntity>
}
