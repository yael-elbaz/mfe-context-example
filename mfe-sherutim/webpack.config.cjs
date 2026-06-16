const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = webpack.container;

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: './src/index.tsx',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'assets/[name].js',
      chunkFilename: 'assets/[name].[contenthash].js',
      publicPath: 'auto',
      uniqueName: 'mfe_sherutim',
      clean: true,
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: 'babel-loader',
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader', 'postcss-loader'],
        },
        {
          test: /\.(woff2?|ttf|eot|otf)$/i,
          type: 'asset/resource',
          generator: { filename: 'assets/[name][ext]' },
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          type: 'asset/resource',
          generator: { filename: 'assets/[name][ext]' },
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({ template: './index.html' }),
      new ModuleFederationPlugin({
        name: 'mfe_sherutim',
        filename: 'assets/remoteEntry.js',
        exposes: {
          './Preview': './src/Preview.tsx',
          './Full': './src/Full.tsx',
        },
        remotes: {
          shell: 'shell@http://localhost:3000/assets/remoteEntry.js',
        },
        shared: {
          react: { singleton: true, eager: false },
          'react-dom': { singleton: true, eager: false },
          zustand: { singleton: true, eager: false },
        },
      }),
    ],
    devServer: {
      port: 3006,
      headers: { 'Access-Control-Allow-Origin': '*' },
      historyApiFallback: true,
      hot: true,
    },
    devtool: isProduction ? 'source-map' : 'eval-source-map',
  };
};
