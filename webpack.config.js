const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs');

// Read API keys from environment variables first, then fall back to .env file
const envFile = path.resolve(__dirname, '.env');
const envVars = {};
if (fs.existsSync(envFile)) {
  fs.readFileSync(envFile, 'utf8').split('\n').forEach(line => {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) {
      envVars[key.trim()] = rest.join('=').trim();
    }
  });
}
// Environment variables (e.g. from CI) take precedence over .env file
if (process.env.NEWS_API_KEY) envVars.NEWS_API_KEY = process.env.NEWS_API_KEY;
if (process.env.ALPHA_VANTAGE_API_KEY) envVars.ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

const compileNodeModules = [
  'react-native',
  '@react-navigation',
  '@react-native',
  'react-native-vector-icons',
  'react-native-rss-parser',
  'react-native-webview',
  'react-native-screens',
  'react-native-safe-area-context',
  '@react-native-async-storage',
  'react-native-gesture-handler',
  'zustand',
].map(mod => path.resolve(__dirname, 'node_modules', mod));

module.exports = {
  entry: path.resolve(__dirname, 'index.web.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  resolve: {
    alias: {
      'react-native$': 'react-native-web',
      'react-native-config': path.resolve(__dirname, 'src/web/mock-config.js'),
    },
    extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js'],
  },
  module: {
    rules: [
      // Force all node_modules .js files to be treated as javascript/auto
      // This fixes the CJS/ESM interop issue with @react-navigation packages
      {
        test: /\.js$/,
        include: /node_modules/,
        type: 'javascript/auto',
      },
      {
        test: /\.(ts|tsx|js|jsx)$/,
        include: [
          path.resolve(__dirname, 'index.web.js'),
          path.resolve(__dirname, 'App.tsx'),
          path.resolve(__dirname, 'src'),
          ...compileNodeModules,
        ],
        use: {
          loader: 'babel-loader',
          options: {
            sourceType: 'unambiguous',
            presets: ['module:@react-native/babel-preset'],
            plugins: [
              ['module-resolver', {root: ['./src'], alias: {'@': './src'}}],
              'react-native-web',
            ],
          },
        },
      },
      {
        test: /\.(gif|jpe?g|png|svg)$/,
        use: {
          loader: 'url-loader',
          options: {name: '[name].[ext]'},
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(true),
      __NEWS_API_KEY__: JSON.stringify(envVars.NEWS_API_KEY || ''),
      __ALPHA_VANTAGE_API_KEY__: JSON.stringify(envVars.ALPHA_VANTAGE_API_KEY || ''),
      process: {env: {}},
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public/index.html'),
    }),
  ],
  devServer: {
    static: path.resolve(__dirname, 'public'),
    hot: true,
    port: 9090,
    client: {
      overlay: {
        warnings: false,
        errors: true,
      },
    },
  },
};
