import { CommandFactory } from "nest-commander"
import { AppModule } from "./app.module"
import { Logger } from "@nestjs/common"

const bootstrap = async () => {
    console.log("Starting CLI...")
    await CommandFactory.run(AppModule, new Logger())
}
bootstrap()
