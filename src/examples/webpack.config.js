const webpack = require('webpack');

module.exports = {
  entry: {
    'example1-jsx': './example1-jsx/index.jsx',
    'example1-tsx': './example1-tsx/index.tsx',
    'example2-jsx': './example2-jsx/index.jsx',
    'example2-tsx': './example2-tsx/index.tsx',
    'example3-tsx': './example3-tsx/index.tsx',
  },
  output: {
    path: __dirname,
    filename: '[name]/entry.js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    loaders: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react']
        },
      }
    ],
  },
};
