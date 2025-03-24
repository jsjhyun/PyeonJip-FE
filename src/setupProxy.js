const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(
        '/api',
        createProxyMiddleware({
            target: 'http://54.180.86.232:8080',
            changeOrigin: true,
        })
    );
};