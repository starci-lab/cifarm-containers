import { envConfig } from "@src/env"

const headlessAvailable = () => {
    const headless1 = envConfig().kafka.headless.headless1
    const headless2 = envConfig().kafka.headless.headless2
    const headless3 = envConfig().kafka.headless.headless3
    return !!(headless1.host && headless1.port && headless2.host && headless2.port && headless3.host && headless3.port)
}

export const kafkaBrokers = (preferHeadless: boolean = true) => {
    return (preferHeadless && headlessAvailable())  ? [
        `${envConfig().kafka.headless.headless1.host}:${envConfig().kafka.headless.headless1.port}`,
        `${envConfig().kafka.headless.headless2.host}:${envConfig().kafka.headless.headless2.port}`,
        `${envConfig().kafka.headless.headless3.host}:${envConfig().kafka.headless.headless3.port}`,
    ] : [
        `${envConfig().kafka.default.default1.host}:${envConfig().kafka.default.default1.port}`,
    ]
}