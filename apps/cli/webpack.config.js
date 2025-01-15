/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path")
const nodeExternals = require("webpack-node-externals")
const GeneratePackageJsonPlugin = require("generate-package-json-webpack-plugin")

// base package
const basePackage = {
    name: "cli-node",
    version: "1.0.0",
    main: "./main.js",
    scripts: {
        "start": "node ./main.js"
    },
    bin: {
        cifarm: "./main.js"
    },
    engines: {
        node: ">= 14",
    },
    dependencies: {
        "sqlite3": "^5.1.7",
        "pg": "8.13.1",
    }
}

module.exports = {
    entry: "./apps/cli/src/main.ts",
    output: {
        path: path.join(__dirname, "../..", "dist", "apps", "cli"),
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
