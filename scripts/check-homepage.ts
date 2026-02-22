/**
 * 检查前台首页状态
 */
const baseUrl = "http://localhost:3000/";

async function main() {
  try {
    const res = await fetch(baseUrl, {
      redirect: "follow",
      headers: { Accept: "text/html" },
    });

    const finalUrl = res.url;
    const statusCode = res.status;
    const html = await res.text();

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : "(无标题)";

    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    const h1Text = h1Match ? h1Match[1].trim() : null;

    const hasNotFoundError = html.includes("This page could not be found");
    const hasBrandText = html.includes("BRAND");
    const hasPrismaError = html.includes("PrismaClientValidationError");

    const success = statusCode === 200 && !hasNotFoundError && !hasPrismaError;

    console.log("=== 前台首页检查结果 ===");
    console.log("最终 URL:", finalUrl);
    console.log("HTTP 状态码:", statusCode);
    console.log("页面加载:", success ? "成功" : "报错");
    console.log("页面标题:", title);
    
    const keyTexts = [];
    if (hasNotFoundError) keyTexts.push("This page could not be found");
    if (hasBrandText) keyTexts.push("BRAND");
    if (h1Text && !hasNotFoundError) keyTexts.push(h1Text);
    if (hasPrismaError) keyTexts.push("Database Error (Prisma)");
    
    console.log("关键文本:", keyTexts.slice(0, 2).join("、") || "(无)");
  } catch (err) {
    console.error("错误:", err);
    process.exit(1);
  }
}

main();
