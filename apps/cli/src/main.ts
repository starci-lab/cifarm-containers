import { CommandFactory } from "nest-commander"
import { AppModule } from "./app.module"

const bootstrap = async () => {
    await CommandFactory.run(AppModule)
}
bootstrap()
