/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path")
const nodeExternals = require("webpack-node-externals")
const GeneratePackageJsonPlugin = require("generate-package-json-webpack-plugin")

const basePackage = {
    name: "gameplay-subgraph",
    version: "1.0.0",
    main: "./main.js",
    scripts: {
        "start": "node ./main.js"
    },
    engines: {
        node: ">= 14",
    },
    dependencies: {
        "@nestjs/platform-express": "^10.0.0",
        "@apollo/subgraph": "2.9.3",
        "@apollo/server": "^4.11.3",
        "ioredis": "^5.4.2",
        "class-transformer": "0.5.1",
    }
}

module.exports = {
    entry: "./apps/gameplay-subgraph/src/main.ts",
    output: {
        path: path.join(__dirname, "../..", "dist", "apps", "gameplay-subgraph"),
        filename: "main.js",
    },
    target: "node",
    externals: [nodeExternals()],
    plugins: [
        new GeneratePackageJsonPlugin(basePackage, {
            resolveContextPaths: [__dirname],
            useInstalledVersions: true,
            excludeDependencies: [          
                // "near-api-js",
                // "near-seed-phrase",
                // "nestjs-grpc-exceptions",
                // "passport-jwt",
                // "rxjs",
                // "socket.io-client",
            ],
        }),
    ],
}
