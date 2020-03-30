const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: "./index.js",
  output: {
    filename: "zeditor.all.js",
    path: __dirname + "/dist"
  },
  devtool: "source-map",
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"]
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        loader: "ts-loader"
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        options: { sourceMap: true },
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [          
          { loader: "style-loader" },
          { loader: "css-loader" }
        ]
      },
      {
        test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
        loader: 'url-loader',
        options: {
          limit: 8192
        }
      },
      {
        enforce: "pre",
        test: /\.js$/,
        loader: "source-map-loader"
      }
    ]
  },
  externals: {
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "ZEditor Demo",
      filename: "example.html",
      template: "example.html"
    })
  ],
  devServer: {
    compress: true,
    port: 9000,
    host: '0.0.0.0',
    index: "example.html",
    open: true
  }
};