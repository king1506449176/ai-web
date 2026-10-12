export async function onRequest(context) {
  const { request, next } = context
  // ===== 在这里改你的密码 =====
  const ACCESS_PASSWORD = '210010'
  // 密码有效期：7天
  const COOKIE_MAX_AGE = 60 * 60 * 24 
  // ============================

  const url = new URL(request.url)

  // 1. 检查 Cookie 是否已经验证通过
  const cookie = request.headers.get('Cookie') || ''
  if (cookie.includes(`access_pwd=${ACCESS_PASSWORD}`)) {
    return next()
  }

  // 2. 处理密码提交
  if (request.method === 'POST' && url.pathname === '/verify-pwd') {
    const formData = await request.formData()
    const inputPwd = formData.get('pwd')
    
    if (inputPwd === ACCESS_PASSWORD) {
      return new Response(null, {
        status: 302,
        headers: {
          'Location': '/',
          'Set-Cookie': `access_pwd=${ACCESS_PASSWORD}; Path=/; Max-Age=${COOKIE_MAX_AGE}; HttpOnly; SameSite=Lax`
        }
      })
    } else {
      return new Response(null, {
        status: 302,
        headers: { 'Location': '/?error=1' }
      })
    }
  }

  // 3. 返回密码输入页
  const showError = url.searchParams.get('error') === '1'
  return new Response(`
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>请输入访问密码</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f5f3ff 0%, #eef2ff 100%);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        .pwd-card {
          width: 320px;
          padding: 32px 24px;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(124, 110, 255, 0.12);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .pwd-card h3 {
          text-align: center;
          color: #333;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .pwd-card input {
          width: 100%;
          padding: 12px 14px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          font-size: 15px;
          outline: none;
          transition: border-color 0.2s;
        }
        .pwd-card input:focus {
          border-color: #7c6eff;
        }
        .pwd-card button {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #7c6eff 0%, #9d8dff 100%);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .pwd-card button:hover {
          opacity: 0.9;
        }
        .error-tip {
          color: #ef4444;
          font-size: 13px;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <form method="POST" action="/verify-pwd" class="pwd-card">
        <h3>请输入访问密码</h3>
        <input type="password" name="pwd" placeholder="输入密码" required autofocus>
        ${showError ? '<div class="error-tip">密码错误，请重试</div>' : ''}
        <button type="submit">进入</button>
      </form>
    </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  })
}
