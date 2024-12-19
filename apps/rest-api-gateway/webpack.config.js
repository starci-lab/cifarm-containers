const path = require("path")
const nodeExternals = require("webpack-node-externals")
const GeneratePackageJsonPlugin = require("generate-package-json-webpack-plugin")

// Base package.json để làm cơ sở
const basePackage = {
    name: "rest-api-gateway-service",
    version: "1.0.0",
    main: "./index.js",
    engines: {
        node: ">= 14",
    },
    scripts: {
        start: "node ./index.js",
    },
}

module.exports = {
    entry: "./src/index.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "index.js",
    },
    target: "node",
    externals: [nodeExternals()],
    plugins: [
        new GeneratePackageJsonPlugin(basePackage, {
            debug: true,
            resolveContextPaths: [
                path.resolve(__dirname), 
                path.resolve(__dirname, "../../"),
            ],
            excludeDependencies: [], 
        }),
    ],
}
