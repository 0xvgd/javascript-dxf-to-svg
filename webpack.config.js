const path = require('path')

module.exports = {
  entry: './src/cli.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'cli.js'
  },
  node: {
    fs: "empty",
    child_process: "empty",
  },
  target: 'node',
  module: {
    rules: [
      {
        enforce: 'post', test: /fontkit[\/\\]index.js$/, loader: "transform-loader?brfs"
      },
      {
        enforce: 'post', test: /unicode-properties[\/\\]index.js$/, loader: "transform-loader?brfs"
      },
      {
        enforce: 'post', test: /linebreak[\/\\]src[\/\\]linebreaker.js/, loader: "transform-loader?brfs"
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets:['@babel/preset-env']
          }
        }
      }
    ]
  }
};
