/**
 * Cloudflare Worker 静态文件服务器
 */

const files = {
  '/': {
    type: 'text/html',
    content: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>房产估值计算器 | House Value</title>
  <style>
${STYLES_CSS}
  </style>
</head>
<body>
${INDEX_HTML_BODY}
<script>
${APP_JS}
</script>
</body>
</html>`
  }
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (files[path]) {
      return new Response(files[path].content, {
        headers: {
          'Content-Type': files[path].type + ';charset=utf-8',
          'Cache-Control': 'max-age=3600'
        }
      });
    }

    return new Response('Not Found', { status: 404 });
  }
};
