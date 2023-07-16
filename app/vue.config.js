const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  configureWebpack: {
    resolve: {
      fallback: {
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "assert": require.resolve("assert"),
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "os": require.resolve("os-browserify"),
        "url": require.resolve("url")

      }
    }
  },
  transpileDependencies: [
    'quasar'
  ],
  devServer: {
    port: 8080,
    proxy: {
      "/user": {
        target: "https://prjcthunt-server.herokuapp.com",
        changeOrigin: true,
      },
      "/proj": {
        target: "https://prjcthunt-server.herokuapp.com",
        changeOrigin: true
      },
      "/tags": {
        target: "https://prjcthunt-server.herokuapp.com",
        changeOrigin: true
      },
      "/feedback": {
        target: "https://prjcthunt-server.herokuapp.com",
        changeOrigin: true
      },
      "/token": {
        target: "https://prjcthunt-server.herokuapp.com",
        changeOrigin: true
      }
    }
  },

  pluginOptions: {
    quasar: {
      importStrategy: 'kebab',
      rtlSupport: false
    }
  }
})
