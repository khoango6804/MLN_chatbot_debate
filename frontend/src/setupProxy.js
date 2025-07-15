const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Always proxy API requests to local backend since we're running on the same server
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      secure: false,
      timeout: 30000, // 30 seconds timeout
      proxyTimeout: 30000,
      onError: (err, req, res) => {
        console.error('❌ Proxy error:', err.message);
        res.writeHead(500, {
          'Content-Type': 'application/json',
        });
        res.end(JSON.stringify({
          error: 'Proxy Error',
          message: err.message,
          detail: 'Backend connection failed'
        }));
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log('🔄 Proxying:', req.method, req.url, '→', proxyReq.path);
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log('✅ Proxy response:', proxyRes.statusCode, req.url);
      },
      logLevel: 'debug'
    })
  );
};
