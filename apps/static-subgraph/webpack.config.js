const path = require("path")
const { IgnorePlugin } = require("webpack")
const {
    swcDefaultsFactory,
} = require("@nestjs/cli/lib/compiler/defaults/swc-defaults")
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin")
const CircularDependencyPlugin = require("circular-dependency-plugin")

/** @type { import("webpack").Configuration } */
module.exports = {
    entry: path.resolve(__dirname, "src/main.ts"),
    externals: {},
    module: {
        rules: [
            {
                exclude: /node_modules/,
                test: /\.ts$/,
                use: {
                    loader: "swc-loader",
                    options: swcDefaultsFactory().swcOptions,
                },
                include: [
                    path.resolve(__dirname, "src"),
                    path.resolve(__dirname, "../../src"),
                ]
            },
        ],
    },
    node: {
        __dirname: false,
        __filename: false,
    },
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, "../../dist/apps/static-subgraph")
    },
    plugins: [
        new IgnorePlugin({
            checkResource(resource) {
                const lazyImports = [
                    "@as-integrations/fastify",
                    "ts-morph",
                    "class-transformer/storage",
                    "mqtt",
                    "nats",
                    "amqplib",
                    "amqp-connection-manager",
                ]
                if (!lazyImports.includes(resource)) {
                    return false
                }
                try {
                    require.resolve(resource, { paths: [process.cwd()] })
                } catch (err) {
                    return true
                }
                return false
            },
        }),
        new CircularDependencyPlugin({
            exclude: /node_modules/,
            failOnError: true,
            allowAsyncCycles: false,
            cwd: process.cwd(),
        }),
    ],
    resolve: {
        extensions: [".js", ".json", ".ts"],
        alias: {
            "@apps": path.resolve(__dirname, "apps"),
            "@src": path.resolve(__dirname, "src"),
        },
        mainFields: ["main"],
        plugins: [new TsconfigPathsPlugin({ configFile: path.resolve(__dirname, "tsconfig.app.json") })],
    },
    target: "node",
}