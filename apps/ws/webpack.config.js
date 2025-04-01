/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path")
const nodeExternals = require("webpack-node-externals")
const GeneratePackageJsonPlugin = require("generate-package-json-webpack-plugin")

// base package
const basePackage = {
    name: "ws",
    verswsn: "1.0.0",
    main: "./main.js",
    scripts: {
        "start": "node ./main.js"
    },
    engines: {
        node: ">= 14",
    },
    dependencies: {
        "@nestjs/platform-express": "^10.0.0",
        "wsredis": "^5.4.2",
    }
}

module.exports = {
    entry: "./apps/ws/src/main.ts",
    output: {
        path: path.join(__dirname, "../..", "dist", "apps", "ws"),
        filename: "main.js",
    },
    target: "node",
    externals: [nodeExternals()],
    plugins: [
        new GeneratePackageJsonPlugin(basePackage, {
            resolveContextPaths: [__dirname],
            useInstalledVerswsns: true,
            excludeDependencies: [          
                
            ],
        }),
    ],
}
