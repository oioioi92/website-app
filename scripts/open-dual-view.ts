/**
 * 打开前台首页的桌面和移动端视图
 */
import { chromium } from "playwright-core";

const baseUrl = "http://localhost:3000/";
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function main() {
  console.log("正在启动浏览器...\n");

  const browser = await chromium.launch({
    headless: false,
    executablePath: chromePath,
  });

  // 创建桌面视图上下文
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });

  // 创建移动端视图上下文（iPhone 14 Pro）
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
    isMobile: true,
    hasTouch: true,
  });

  // 打开桌面视图页面
  const desktopPage = await desktopContext.newPage();
  console.log("正在加载桌面视图...");
  await desktopPage.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 15000 });
  await desktopPage.waitForTimeout(2000);

  // 打开移动端视图页面
  const mobilePage = await mobileContext.newPage();
  console.log("正在加载移动端视图...\n");
  await mobilePage.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 15000 });
  await mobilePage.waitForTimeout(2000);

  // 检查桌面视图
  const desktopUrl = desktopPage.url();
  const desktopTitle = await desktopPage.title();
  const desktopHasError = await desktopPage.locator('text="This page could not be found"').isVisible().catch(() => false);
  const desktopText = await desktopPage.locator("h1, h2, p").first().textContent().catch(() => null);
  const desktopSuccess = !desktopHasError;

  // 检查移动端视图
  const mobileUrl = mobilePage.url();
  const mobileTitle = await mobilePage.title();
  const mobileHasError = await mobilePage.locator('text="This page could not be found"').isVisible().catch(() => false);
  const mobileText = await mobilePage.locator("h1, h2, p").first().textContent().catch(() => null);
  const mobileSuccess = !mobileHasError;

  console.log("=== 双视图检查结果 ===\n");
  
  console.log("【桌面视图】");
  console.log("  URL:", desktopUrl);
  console.log("  Title:", desktopTitle);
  console.log("  加载状态:", desktopSuccess ? "成功" : "报错");
  console.log("  可见文本:", desktopText?.trim() || "(无)");
  
  console.log("\n【移动端视图】");
  console.log("  URL:", mobileUrl);
  console.log("  Title:", mobileTitle);
  console.log("  加载状态:", mobileSuccess ? "成功" : "报错");
  console.log("  可见文本:", mobileText?.trim() || "(无)");
  
  console.log("\n✓ 两个视图已打开并保持可见");
  console.log("  提示：关闭此终端前，浏览器窗口将保持打开状态");

  // 保持浏览器打开，等待用户手动关闭
  await new Promise(() => {}); // 永久等待
}

main().catch((err) => {
  console.error("错误:", err);
  process.exit(1);
});
