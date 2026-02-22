/**
 * 排查 https://admin1167.net 的后台登录回跳问题
 */
import { chromium } from "playwright-core";

const loginUrl = "https://admin1167.net/admin/login";
const email = "admin@example.com";
const password = "change_me_123";
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function main() {
  console.log("=== 后台登录回跳问题排查 ===\n");

  const browser = await chromium.launch({
    headless: false,
    executablePath: chromePath,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  // 记录所有导航事件
  const navigationLog: string[] = [];
  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame()) {
      navigationLog.push(`[${new Date().toISOString().split('T')[1].slice(0, -1)}] ${frame.url()}`);
    }
  });

  try {
    // 步骤 1: 打开登录页
    console.log("步骤 1: 打开登录页...");
    await page.goto(loginUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(2000);

    const initialUrl = page.url();
    console.log("  最终 URL:", initialUrl);

    // 步骤 2: 检查是否是登录页
    const hasEmailInput = await page.locator('input[type="email"], input[placeholder*="Email"], input[placeholder*="email"]').count() > 0;
    const hasPasswordInput = await page.locator('input[type="password"]').count() > 0;
    const hasLoginButton = await page.locator('button:has-text("登录"), button:has-text("Login"), button[type="submit"]').count() > 0;
    const isLoginPage = hasEmailInput && hasPasswordInput;

    console.log("  是否是登录页:", isLoginPage ? "是" : "否");
    console.log("  - Email 输入框:", hasEmailInput ? "存在" : "不存在");
    console.log("  - Password 输入框:", hasPasswordInput ? "存在" : "不存在");
    console.log("  - 登录按钮:", hasLoginButton ? "存在" : "不存在");

    if (!isLoginPage) {
      console.log("\n⚠️ 页面不是登录页，停止操作");
      await page.screenshot({ path: "screenshots/not-login-page.png", fullPage: true });
      await browser.close();
      return;
    }

    // 步骤 3: 尝试登录（仅 1 次）
    console.log("\n步骤 2: 尝试登录...");
    
    // 填写邮箱
    const emailInput = page.locator('input[type="email"], input[placeholder*="Email"], input[placeholder*="email"]').first();
    await emailInput.fill(email);
    console.log("  ✓ 已填写邮箱:", email);

    // 填写密码
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill(password);
    console.log("  ✓ 已填写密码: ********");

    await page.waitForTimeout(500);

    // 记录登录前的 URL
    const urlBeforeLogin = page.url();
    const domainBeforeLogin = new URL(urlBeforeLogin).hostname;
    console.log("  登录前域名:", domainBeforeLogin);

    // 点击登录按钮
    const loginButton = page.locator('button:has-text("登录"), button:has-text("Login"), button[type="submit"]').first();
    await loginButton.click();
    console.log("  ✓ 已点击登录按钮");

    // 步骤 4: 观察登录后的行为
    console.log("\n步骤 3: 观察登录后行为...");
    
    // 等待可能的导航或错误消息
    await page.waitForTimeout(3000);

    // 检查是否有多次导航（loop 检测）
    const urlAfterLogin1 = page.url();
    await page.waitForTimeout(2000);
    const urlAfterLogin2 = page.url();
    await page.waitForTimeout(2000);
    const urlAfterLogin3 = page.url();

    const domainAfterLogin = new URL(urlAfterLogin3).hostname;

    console.log("  登录后 URL 变化:");
    console.log("    +1s:", urlAfterLogin1);
    console.log("    +3s:", urlAfterLogin2);
    console.log("    +5s:", urlAfterLogin3);

    // 检查域名变化
    const domainChanged = domainBeforeLogin !== domainAfterLogin;
    console.log("\n  域名是否变化:", domainChanged ? `是 (${domainBeforeLogin} → ${domainAfterLogin})` : "否");

    // 检查是否有 loop（/admin → /admin/login）
    const hasLoop = navigationLog.some((log, idx) => {
      if (idx === 0) return false;
      return log.includes("/admin") && !log.includes("/admin/login") && 
             navigationLog[idx + 1]?.includes("/admin/login");
    });

    console.log("  是否检测到回跳 loop:", hasLoop ? "是" : "否");

    // 检查错误消息
    const errorMessages = await page.locator('text=/登录失败|失败|error|Error|invalid|Invalid|incorrect|Incorrect/i').allTextContents();
    const hasErrorMessage = errorMessages.length > 0;

    console.log("  是否有错误提示:", hasErrorMessage ? "是" : "否");
    if (hasErrorMessage) {
      console.log("    错误内容:", errorMessages.slice(0, 3).join("; "));
    }

    // 判断最终状态
    let finalStatus = "";
    if (urlAfterLogin3.includes("/admin/login")) {
      if (hasLoop) {
        finalStatus = "检测到回跳 loop (/admin → /admin/login)";
      } else if (hasErrorMessage) {
        finalStatus = "停留在登录页（有错误提示）";
      } else {
        finalStatus = "停留在登录页（未跳转，可能登录失败）";
      }
    } else if (urlAfterLogin3.includes("/admin")) {
      finalStatus = "成功跳转到后台首页";
    } else {
      finalStatus = `跳转到其他页面: ${urlAfterLogin3}`;
    }

    console.log("\n=== 排查结论 ===");
    console.log("最终状态:", finalStatus);
    console.log("最终 URL:", urlAfterLogin3);
    console.log("域名变化:", domainChanged ? `${domainBeforeLogin} → ${domainAfterLogin}` : "无");
    
    console.log("\n导航历史:");
    navigationLog.forEach((log, idx) => {
      console.log(`  ${idx + 1}. ${log}`);
    });

    // 截图
    await page.screenshot({ path: "screenshots/login-final-state.png", fullPage: true });
    console.log("\n✓ 已保存截图: screenshots/login-final-state.png");

    console.log("\n提示：浏览器将保持打开 10 秒供查看...");
    await page.waitForTimeout(10000);

  } catch (err) {
    console.error("\n❌ 错误:", err);
    await page.screenshot({ path: "screenshots/login-error.png", fullPage: true });
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("致命错误:", err);
  process.exit(1);
});
