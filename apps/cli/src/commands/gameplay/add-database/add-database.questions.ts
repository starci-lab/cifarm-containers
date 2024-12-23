import { QuestionSet, Question } from "nest-commander"

export const ADD_DATABASE_QUESTIONS_NAME = "add-database-questions"

@QuestionSet({
    name: ADD_DATABASE_QUESTIONS_NAME,
})
export class AddDatabaseQuestions {
    // Define the database name question
    @Question({
        message: "What is the name of the database? (default: gameplay)",
        name: "dbName",
    })
    parseDbName(value: string): string {
        return value || "gameplay"
    }

    // Define the host question
    @Question({
        message: "What is the host of the database? (default: localhost)",
        name: "host",
    })
    parseHost(value: string): string {
        return value || "localhost"
    }

    // Define the port question with validation
    @Question({
        message: "What is the port of the database? (default: 5432)",
        name: "port",
        validate(value: string): boolean | string {
            const port = parseInt(value, 10)
            if (isNaN(port)) {
                return "Port must be a valid number."
            }
            if (port < 1 || port > 65535) {
                return "Port must be between 1 and 65535."
            }
            return true
        },
    })
    parsePort(value: string): number {
        // Default to 5432 if empty or invalid input
        return value ? parseInt(value, 10) : 5432
    }

    // Define the username question
    @Question({
        message: "What is the username for the database? (default: postgres)",
        name: "username",
    })
    parseUsername(value: string): string {
        return value || "postgres"
    }

    // Define the password question
    @Question({
        message: "What is the password for the database? (required)",
        name: "password",
        type: "password", // Hide input for password
    })
    parsePassword(value: string): string {
        return value
    }
}
