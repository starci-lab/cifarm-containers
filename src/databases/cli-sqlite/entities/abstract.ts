import { Field, ObjectType } from "@nestjs/graphql"
import { ClassConstructor, instanceToPlain, plainToInstance } from "class-transformer"
import { CreateDateColumn, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"

export abstract class AbstractEntity {
    @Field(() => Date)
    @CreateDateColumn({ type: "date", name: "created_at" })
        createdAt: Date

    @Field(() => Date)
    @UpdateDateColumn({ type: "date", name: "updated_at" })
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
    @PrimaryGeneratedColumn("uuid", {
        name: "id"
    })
        id: string
}

@ObjectType({
    isAbstract: true
})
export abstract class StringAbstractEntity extends AbstractEntity {
    @PrimaryColumn({ name: "id", type: "varchar", length: 36 })
        id: string
}
