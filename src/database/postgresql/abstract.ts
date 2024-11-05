

import {
    CreateDateColumn,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm"
import { Field, ID } from "@nestjs/graphql"
import { ClassConstructor, plainToInstance, instanceToPlain  } from "class-transformer"

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