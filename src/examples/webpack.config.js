const webpack = require('webpack');

module.exports = {
  entry: {
    example1: './example1/index.tsx',
  },
  output: {
    path: __dirname,
    filename: '[name]/entry.js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    loaders: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      }
    ],
  },
};
