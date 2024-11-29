

import { Field, ID, ObjectType } from "@nestjs/graphql"
import { ClassConstructor, instanceToPlain, plainToInstance } from "class-transformer"
import {
    CreateDateColumn,
    PrimaryColumn,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm"

export abstract class AbstractEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn("uuid", {
        name: "id"
    })
        id: string
    
    @Field(() => Date)
    @CreateDateColumn({name: "created_at"})
        createdAt: Date
    
    @Field(() => Date)
    @UpdateDateColumn({name: "updated_at"})
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
export abstract class ReadableAbstractEntity{
    @Field(() => ID)
    @PrimaryColumn({ name: "id", type: "varchar", length: 36 })
        id: string

    @Field(() => Date)
    @CreateDateColumn({ name: "created_at" })
        createdAt: Date

    @Field(() => Date)
    @UpdateDateColumn({ name: "updated_at" })
        updatedAt: Date

    toDto<Dto>(dtoClass: ClassConstructor<Dto>): Dto {
        return plainToInstance(dtoClass, this)
    }

    toPlain<Plain>(): Plain {
        return instanceToPlain(this) as Plain
    }
}
