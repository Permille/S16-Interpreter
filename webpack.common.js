const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const path = require("path");

module.exports = {
  "entry": "./src/Main.mjs",
  "target": "web",
  "output": {
    "filename": "Bundle.js",
    "path": path.resolve(__dirname, "dist")
  },
  "resolve":{
    "fallback":{
      "crypto": false
    }
  },
  "experiments":{
    "topLevelAwait": true
  },
  "resolveLoader":{
    "alias":{
      "WatCompilerLoader": path.resolve(__dirname, "WatCompilerLoader.js")
    }
  },
  "module":{
    "rules":[
      {
        "test": /\.(woff|woff2|ttf|eot|png|svg|bmp|bin)$/i,
        "type": "asset/resource"
      },
      {
				"test": /\.css$/,
				"use": ['style-loader', 'css-loader']
			},
      {
        "test": /\.(fsh|vsh|glsl|wgsl)$/i,
        "type": "asset/source"
      },
      {
        "test": /\.wat$/i,
        "use": ["WatCompilerLoader"]
      },
      {
        "test": /\.wasm$/i,
        "use": ["arraybuffer-loader"]
      },
      {
        "resourceQuery": /file/i,
        "type": 'asset/resource',
      },
      {
        "resourceQuery": /url/i,
        "type": 'asset/inline',
      },
      {
        "resourceQuery": /raw/i,
        "type": 'asset/source',
      },
      {
        "resourceQuery": /copy/i,
        "loader": "file-loader",
        "options": {
          "name": "[name].[ext]"
        }
      }
    ]
  },
  "plugins": [new MonacoWebpackPlugin]
};