import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity, Index, JoinColumn, ManyToOne, Relation } from "typeorm"
import { UuidAbstractEntity } from "./abstract"
import { ProductEntity } from "./product.entity"
import { UserEntity } from "./user.entity"

@ObjectType()
@Entity("delivering_products")
export class DeliveringProductEntity extends UuidAbstractEntity {
    @Field(() => Int)
    @Column({ name: "quantity", type: "int" })
        quantity: number

    @Field(() => Int)
    @Column({ name: "index", type: "int" })
        index: number

    @Field(() => Boolean)
    @Column({ name: "premium", type: "boolean" })
        premium: boolean

    // foreign keys
    @Field(() => String, { nullable: true })
    @Index()
    @Column({ name: "user_id", nullable: true })
        userId: string

    @Field(() => UserEntity, { nullable: true })
    @ManyToOne(() => UserEntity, (user) => user.inventories, { onDelete: "CASCADE", eager: true })
    @JoinColumn({ name: "user_id", referencedColumnName: "id" })
        user?: Relation<UserEntity>

    @Field(() => String, { nullable: true })
    @Column({ name: "product_id", nullable: true })
        productId: string

    @Field(() => ProductEntity, { nullable: true })
    @ManyToOne(() => ProductEntity, (user) => user.deliveringProducts, {
        onDelete: "SET NULL"
    })
    @JoinColumn({ name: "product_id", referencedColumnName: "id" })
        product?: Relation<ProductEntity>
}
