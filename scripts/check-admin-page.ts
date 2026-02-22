/**
 * 快速检查 /admin 页面状态：是否进入后台首页或被重定向到登录页
 * 不提交表单、不猜测密码
 */
export {};

const baseUrl = "http://localhost:3000/admin";

async function main() {
  try {
    const res = await fetch(baseUrl, {
      redirect: "follow",
      headers: { Accept: "text/html" },
    });

    const finalUrl = res.url;
    const html = await res.text();

    const isLoginPage =
      finalUrl.includes("/admin/login") ||
      html.includes('placeholder="Email"') ||
      html.includes('placeholder="Password"') ||
      html.includes("Admin 登录") ||
      html.includes("登录");

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : "(无标题)";

    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    const keyText = h1Match ? h1Match[1].trim() : null;

    console.log("=== Admin 页面检查结果 ===");
    console.log("最终 URL:", finalUrl);
    console.log("页面标题:", title);
    console.log("关键文本:", keyText || "(无)");
    console.log("是否需要登录:", isLoginPage ? "是" : "否");
  } catch (err) {
    console.error("错误:", err);
    process.exit(1);
  }
}

main();
