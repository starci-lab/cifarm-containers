/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path")
const nodeExternals = require("webpack-node-externals")
const GeneratePackageJsonPlugin = require("generate-package-json-webpack-plugin")
const CopyWebpackPlugin = require("copy-webpack-plugin")

// base package
const basePackage = {
    name: "telegram-bot",
    version: "1.0.0",
    main: "./main.js",
    scripts: {
        "start": "node ./main.js"
    },
    engines: {
        node: ">= 14",
    },
    dependencies: {
        "pg": "8.13.1",
        "@nestjs/platform-express": "^10.0.0"
    },
    overrides: {
        "typeorm": {
            "mongodb": "^6.12.0"
        }
    },
}

module.exports = {
    entry: "./apps/telegram-bot/src/main.ts",
    output: {
        path: path.join(__dirname, "../..", "dist", "apps", "telegram-bot"),
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
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, "src/assets"),
                    to: path.resolve(__dirname, "../../dist/apps/telegram-bot/assets"),
                },
            ],
        }),
    ]
}
