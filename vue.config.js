const { defineConfig } = require('@vue/cli-service')
module.exports = {
  chainWebpack: (config) => {
    // 添加对 .vue 文件的处理
    config.module
      .rule('vue')
      .use('vue-loader')
      .loader('vue-loader')
      .end();
  },
  configureWebpack: {
    // 添加 Babel 配置
    module: {
      rules: [
        {
          test: /\.js$/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        },
      ],
    },
  },
};