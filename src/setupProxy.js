import localConfig from "./localConfig.json";

const { createProxyMiddleware } = require("http-proxy-middleware");
module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: localConfig.SERVICE.URL + ":" + localConfig.SERVICE.PORT,
      changeOrigin: true,
    })
  );
};
