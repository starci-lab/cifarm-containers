import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToOne } from "typeorm"
import { AnimalEntity } from "./animal.entity"
import { PlacedItemEntity } from "./placed-item.entity"
import { UserEntity } from "./user.entity"
import { AbstractEntity } from "./abstract"
import { AnimalCurrentState } from "./enums"

@ObjectType()
@Entity("animal_info")
export class AnimalInfoEntity extends AbstractEntity {
    @Field(() => Number)
    @Column({ type: "int", nullable: true })
        currentGrowthTime: number

    @Field(() => Number)
    @Column({ type: "int", nullable: true })
        currentHungryTime: number

    @Field(() => Number)
    @Column({ type: "int", nullable: true })
        currentYieldTime: number

    @Field(() => Boolean)
    @Column({ type: "boolean", nullable: true })
        hasYielded: boolean

    @Field(() => Boolean)
    @Column({ type: "boolean", nullable: true })
        isAdult: boolean

    @Field(() => AnimalEntity)
    @ManyToOne(() => AnimalEntity, { nullable: true, eager: true })
        animal: AnimalEntity

    @Field(() => String)
    @Column({ type: "enum", enum: AnimalCurrentState })
        currentState: AnimalCurrentState

    @Field(() => Int)
    @Column({ type: "int", nullable: true })
        harvestQuantityRemaining: number

    @ManyToMany(() => UserEntity)
    @JoinTable()
        thiefedBy: Array<UserEntity>

    @Field(() => Boolean)
    @Column({ type: "boolean", nullable: true })
        alreadySick: boolean

    @Field(() => PlacedItemEntity)
    @OneToOne(() => PlacedItemEntity, (placedItem) => placedItem.animalInfo, {
        onDelete: "CASCADE"
    })
        placedItem?: PlacedItemEntity
}
