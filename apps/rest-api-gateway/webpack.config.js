const path = require("path")
const nodeExternals = require("webpack-node-externals")
const GeneratePackageJsonPlugin = require("generate-package-json-webpack-plugin")

// Base package.json để làm cơ sở
const basePackage = {
    name: "rest-api-gateway",
    version: "1.0.0",
    main: "./index.js",
    engines: {
        node: ">= 14",
    }
}

module.exports = {
    entry: "./apps/rest-api-gateway/src/main.ts",
    output: {
        path: path.join(__dirname, "../..", "dist", "apps", "rest-api-gateway"),
        filename: "main.ts",
    },
    target: "node",
    externals: [nodeExternals()],
    plugins: [
        new GeneratePackageJsonPlugin(basePackage, {
            sourcePackageFilenames: [path.join(__dirname, "../..", "package.json")],
            excludeDependencies: [
                "socket.io"
            ],
        }),
    ],
}
