import { Field, Float, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity, JoinColumn, OneToMany, OneToOne, RelationId } from "typeorm"
import { StringAbstractEntity } from "./abstract"
import { AnimalEntity } from "./animal.entity"
import { CropEntity } from "./crop.entity"
import { ProductType } from "../enums"
import { InventoryTypeEntity } from "./inventory-type.entity"
import { DeliveringProductEntity } from "./delivering-product.entity"

@ObjectType()
@Entity("products")
export class ProductEntity extends StringAbstractEntity {
    @Field(() => Boolean)
    @Column({ name: "is_premium", type: "boolean" })
        isPremium: boolean

    @Field(() => Int)
    @Column({ name: "gold_amount", type: "int" })
        goldAmount: number

    @Field(() => Float)
    @Column({ name: "token_amount", type: "float" })
        tokenAmount: number

    @Field(() => String)
    @Column({ name: "type", type: "enum", enum: ProductType })
        type: ProductType

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

    @Field(() => String)
    @RelationId((product: ProductEntity) => product.inventoryType)
        inventoryTypeId: string

    @Field(() => InventoryTypeEntity)
    @OneToOne(() => InventoryTypeEntity, (inventoryType) => inventoryType.product, {
        onDelete: "CASCADE",
        cascade: ["insert"]
    })
        inventoryType: InventoryTypeEntity
     
    @Field(() => [DeliveringProductEntity])
    @OneToMany(() => DeliveringProductEntity, (deliveringProduct) => deliveringProduct.product)
        deliveringProducts?: Array<DeliveringProductEntity>
}
