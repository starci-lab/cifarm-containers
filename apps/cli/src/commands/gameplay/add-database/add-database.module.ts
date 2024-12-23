import { Module } from "@nestjs/common"
import { AddDatabaseCommand } from "./add-database.command"
import { AddDatabaseQuestions } from "./add-database.questions"

@Module({
    imports: [],
    providers: [ AddDatabaseCommand, AddDatabaseQuestions ],
    exports: [ AddDatabaseCommand ]
})
export class AddDatabaseModule {}