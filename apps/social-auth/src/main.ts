import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { envConfig, isProduction } from "@src/env"
import { HealthCheckDependency, HealthCheckModule } from "@src/health-check"
import { IdLogger } from "@src/id"
import { NestExpressApplication } from "@nestjs/platform-express"
import { IdService } from "@src/id"
import session from "express-session"
import passport from "passport"

const bootstrap = async () => {
    const app = await NestFactory.create<NestExpressApplication>(AppModule)
    app.useLogger(new IdLogger(app.get(IdService)))
    app.enableCors(
        // {
        // origin: envConfig().cors.graphql,
        // }
    )
    app.set("trust proxy", "loopback")  
    app.use(
        session({
            secret: envConfig().session.secret,
            resave: false,
            saveUninitialized: false,
            cookie: { secure: isProduction() }, // Use `secure: true` in production with HTTPS
        }),
    )
    app.use(passport.initialize())
    app.use(passport.session())
    app.enableShutdownHooks()
    await app.listen(envConfig().containers.socialAuth.port)
}

const bootstrapHealthCheck = async () => {
    const app = await NestFactory.create(HealthCheckModule.forRoot({
        dependencies: [
            HealthCheckDependency.GameplayMongoDb
        ]
    }))
    await app.listen(envConfig().containers.socialAuth.healthCheckPort)
}
bootstrap().then(bootstrapHealthCheck)
