import { ClassConstructor, instanceToPlain, plainToInstance } from "class-transformer"
import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"

export abstract class AbstractEntity {
    @CreateDateColumn({ type: "timestamptz", name: "created_at" })
        createdAt: Date

    @UpdateDateColumn({ type: "timestamptz", name: "updated_at" })
        updatedAt: Date

    toDto<Dto>(dtoClass: ClassConstructor<Dto>): Dto {
        return plainToInstance(dtoClass, this)
    }

    toPlain<Plain>(): Plain {
        return instanceToPlain(this) as Plain
    }
}

export abstract class UuidAbstractEntity extends AbstractEntity {
    @PrimaryGeneratedColumn("uuid", {
        name: "id"
    })
        id: string
}