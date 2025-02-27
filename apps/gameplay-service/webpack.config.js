/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path")
const nodeExternals = require("webpack-node-externals")
const GeneratePackageJsonPlugin = require("generate-package-json-webpack-plugin")

// base package
const basePackage = {
    name: "gameplay-service",
    version: "1.0.0",
    main: "./main.js",
    scripts: {
        "start": "node ./main.js"
    },
    engines: {
        node: ">= 14",
    },
    dependencies: {
        "kafkajs": "^2.2.4",
        "@nestjs/platform-express": "^10.0.0",
        "ioredis": "^5.4.2",
    },
}

module.exports = {
    entry: "./apps/gameplay-service/src/main.ts",
    output: {
        path: path.join(__dirname, "../..", "dist", "apps", "gameplay-service"),
        filename: "main.js",
    },
    target: "node",
    externals: [nodeExternals()],
    plugins: [
        new GeneratePackageJsonPlugin(basePackage, {
            resolveContextPaths: [__dirname],
            useInstalledVersions: true,
            excludeDependencies: [          
                
            ],
        }),
    ],
}
