const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
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
      uniqueName: 'shell',
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
      new webpack.DefinePlugin({
        __FONT_BASE_URL__: JSON.stringify(process.env.VITE_FONT_BASE_URL ?? './assets'),
      }),
      new CopyWebpackPlugin({
        patterns: [{ from: 'src/assets', to: 'assets' }],
      }),
      new ModuleFederationPlugin({
        name: 'shell',
        filename: 'assets/remoteEntry.js',
        // מה ה-Shell מחשיף ל-MFEs
        exposes: {
          './store': './src/store/appContext.ts',
          './employeeStore': './src/store/employeeStore.ts',
          './personStore': './src/store/personStore.ts',
        },
        remotes: {
          mfe_tasks: 'mfe_tasks@http://localhost:3001/assets/remoteEntry.js',
          mfe_search_employee: 'mfe_search_employee@http://localhost:3002/assets/remoteEntry.js',
          mfe_employee_portfolio: 'mfe_employee_portfolio@http://localhost:3003/assets/remoteEntry.js',
          mfe_digital_objects: 'mfe_digital_objects@http://localhost:3004/assets/remoteEntry.js',
          mfe_sherutim: 'mfe_sherutim@http://localhost:3006/assets/remoteEntry.js',
        },
        shared: {
          react: { singleton: true, eager: true },
          'react-dom': { singleton: true, eager: true },
          zustand: { singleton: true, eager: true },
          'react-router-dom': { singleton: true, eager: true },
        },
      }),
    ],
    optimization: {
      minimize: false,
    },
    devServer: {
      port: 3000,
      headers: { 'Access-Control-Allow-Origin': '*' },
      historyApiFallback: true,
      hot: true,
      static: {
        directory: path.resolve(__dirname, 'src/assets'),
        publicPath: '/assets',
      },
    },
    devtool: isProduction ? 'source-map' : 'eval-source-map',
  };
};
