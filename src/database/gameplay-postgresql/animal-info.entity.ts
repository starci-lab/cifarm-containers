import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne } from "typeorm"
import { UuidAbstractEntity } from "./abstract"
import { AnimalEntity } from "./animal.entity"
import { AnimalCurrentState } from "./enums"
import { PlacedItemEntity } from "./placed-item.entity"
import { UserEntity } from "./user.entity"

@ObjectType()
@Entity("animal_infos")
export class AnimalInfoEntity extends UuidAbstractEntity {
    @Field(() => Number)
    @Column({ type: "int", default: 0 })
        currentGrowthTime: number

    @Field(() => Number)
    @Column({ type: "int", default: 0 })
        currentHungryTime: number

    @Field(() => Number)
    @Column({ type: "int", default: 0 })
        currentYieldTime: number

    @Field(() => Boolean)
    @Column({ type: "boolean", default: false })
        hasYielded: boolean

    @Field(() => Boolean)
    @Column({ type: "boolean", default: false })
        isAdult: boolean

    @Field(() => String)
    @Column({ name: "animal_id" })
        animalId: string

    @Field(() => AnimalEntity)
    @ManyToOne(() => AnimalEntity, { nullable: true, onDelete: "CASCADE" })
    @JoinColumn({ name: "animal_id", referencedColumnName: "id" })
        animal: AnimalEntity

    @Field(() => String)
    @Column({ type: "enum", enum: AnimalCurrentState, default: AnimalCurrentState.Normal })
        currentState: AnimalCurrentState

    @Field(() => Int)
    @Column({ type: "int", nullable: true })
        harvestQuantityRemaining?: number

    @ManyToMany(() => UserEntity)
    @JoinTable()
        thiefedBy: Array<UserEntity>

    @Field(() => Boolean)
    @Column({ type: "boolean", default: false })
        alreadySick: boolean

    @Field(() => PlacedItemEntity)
    @OneToOne(() => PlacedItemEntity, (placedItem) => placedItem.animalInfo, {
        onDelete: "CASCADE"
    })
        placedItem?: PlacedItemEntity
}
