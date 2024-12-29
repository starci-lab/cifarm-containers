import { GameplayPostgreSQLType } from "../../gameplay-postgresql"
import { UuidAbstractEntity } from "./abstract"
import { Column, Entity } from "typeorm"

@Entity("gameplay-postgresql")
export class GameplayPostgreSQLEntity extends UuidAbstractEntity {
    @Column({ type: "varchar", length: 100 })
        host: string
    @Column({ type: "int" })
        port: number
    @Column({ type: "varchar", length: 40 })
        username: string
    @Column({ type: "varchar", length: 40 })
        password: string
    @Column({ type: "varchar", length: 40 })
        dbName: string
    @Column({ type: "boolean", default: true })
        selected: boolean
    @Column({ type: "varchar", length: 100, unique: true })
        type: GameplayPostgreSQLType
}