import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity, JoinColumn, OneToOne } from "typeorm"
import { AbstractEntity } from "./abstract"
import { ProductType } from "./enums"
import { AnimalEntity } from "./animal.entity"
import { CropEntity } from "./crop.entity"

@ObjectType()
@Entity("product")
export class ProductEntity extends AbstractEntity {
    @Field(() => Boolean)
    @Column({ name: "is_premium", type: "boolean" })
        isPremium: boolean
   
    @Field(() => Int)
    @Column({ name: "gold_amount", type: "int" })
        goldAmount: number

    @Field(() => Float)
    @Column({ name: "token_amount", type: "float" })
        tokenAmount: number

    @Field(() => ProductType)
    @Column({ name: "type", type: "enum", enum: ProductType })
        type: ProductType

    @Field(() => ID, { nullable: true })
    @Column({ name: "animal_id", type: "uuid", nullable: true })
        animalId: number

    @Field(() => AnimalEntity)
    @OneToOne(() => AnimalEntity, (animal) => animal.product)
    @JoinColumn({ name: "animal_id" })
        animal: AnimalEntity

    @Field(() => ID, { nullable: true })
    @Column({ name: "crop_id", type: "uuid", nullable: true })
        cropId: number

    @Field(() => CropEntity)
    @OneToOne(() => CropEntity, (crop) => crop.product)
    @JoinColumn({ name: "crop_id" })
        crop: CropEntity
}
