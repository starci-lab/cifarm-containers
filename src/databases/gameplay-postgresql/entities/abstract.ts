import { Field, ID, ObjectType } from "@nestjs/graphql"
import { ClassConstructor, instanceToPlain, plainToInstance } from "class-transformer"
import { CreateDateColumn, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"

@ObjectType({
    isAbstract: true
})
export abstract class AbstractEntity {
    @Field(() => Date)
    @CreateDateColumn({ type: "timestamptz", name: "created_at" })
        createdAt: Date

    @Field(() => Date)
    @UpdateDateColumn({ type: "timestamptz", name: "updated_at" })
        updatedAt: Date

    toDto<Dto>(dtoClass: ClassConstructor<Dto>): Dto {
        return plainToInstance(dtoClass, this)
    }

    toPlain<Plain>(): Plain {
        return instanceToPlain(this) as Plain
    }
}

@ObjectType({
    isAbstract: true
})
export abstract class UuidAbstractEntity extends AbstractEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn("uuid", {
        name: "id"
    })
        id: string
}

@ObjectType({
    isAbstract: true
})
export abstract class StringAbstractEntity extends AbstractEntity {
    @Field(() => ID)
    @PrimaryColumn({ name: "id", type: "varchar", length: 36 })
        id: string
}
