const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader'
          },
          {
            loader: 'sass-loader',
            options: {
              // sourceMap: true,
              // options...
            }
          }
        ]
      },
      // x-data-spreadsheet
      {
        test: /\.css$/,
        use: [
          {
            "loader": MiniCssExtractPlugin.loader,
            "options": {
              publicPath: '',
            }
          },
          'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.less$/,
        use: [
          {
            "loader": MiniCssExtractPlugin.loader,
            "options": {
              publicPath: '',
            }
          },
          'css-loader',
          'less-loader',
        ],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          {
            loader: "file-loader",
          }
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          'file-loader',
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'js/bundle.js',
    path: path.resolve(__dirname, 'homepage/dist'),
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/main.css'
    }),
  ],
  optimization: {
    minimize: false,
  },
  externals: [
    {
      // Load some of the heaviest modules externally to reduce loading times
      // "katex":{
      //   var: "katex",
      //   externalsType: 'promise',
      // },
      "codemirror":"CodeMirror",
      // "@toast-ui/editor":{
      //   root: "toastui",
      //   commonjs: "toastui",
      //   commonjs2: 'toastui',
      //   amd: 'toastui',
      // },
      "pako":"pako",
      "katex": "katex",
      // "Spreadsheet": "x-data-spreadsheet",
      "google": 'google',
    },
  ]
};