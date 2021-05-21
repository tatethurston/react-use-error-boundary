// eslint-disable-next-line
const { resolve } = require("path");

// eslint-disable-next-line no-undef
module.exports = {
  entry: "./src/index.tsx",
  mode: "production",
  output: {
    // eslint-disable-next-line no-undef
    path: resolve(__dirname, "dist"),
    filename: "index.production.js",
    library: {
      name: "react-itertools",
      type: "umd",
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "babel-loader",
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  externals: {
    react: {
      commonjs: "react",
      commonjs2: "react",
      amd: "react",
      root: "react",
    },
  },
};
