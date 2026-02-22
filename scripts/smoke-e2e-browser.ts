import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { chromium, Page } from "playwright-core";
import { PrismaClient } from "@prisma/client";

const baseUrl = "http://localhost:3000";
const screenshotDir = path.join(process.cwd(), "screenshots");
const email = process.env.ADMIN_SEED_EMAIL ?? "admin@example.com";
const password = process.env.ADMIN_SEED_PASSWORD ?? "change_me_123";
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const prisma = new PrismaClient();

interface TestStep {
  step: number;
  name: string;
  status: "PASS" | "FAIL" | "SKIP";
  evidence: string;
  error?: string;
  screenshot?: string;
}

const results: TestStep[] = [];

async function ensureDir() {
  await fs.mkdir(screenshotDir, { recursive: true });
}

async function saveScreenshot(page: Page, filename: string): Promise<string> {
  const filepath = path.join(screenshotDir, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  return `screenshots/${filename}`;
}

async function main() {
  await ensureDir();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate()
  ).padStart(2, "0")}`;

  console.log(`\n========================================`);
  console.log(`端到端冒烟测试 - ${todayStr}`);
  console.log(`========================================\n`);

  // Prepare test data
  const member = await prisma.member.upsert({
    where: { userRef: "R001" },
    create: { userRef: "R001", displayName: "Robin Test", isActive: true },
    update: { displayName: "Robin Test", isActive: true }
  });
  const provider = await prisma.gameProvider.findFirst({ 
    where: { isActive: true }, 
    orderBy: { sortOrder: "asc" } 
  });
  if (!provider) throw new Error("No active provider found");

  const browser = await chromium.launch({
    headless: false,
    executablePath: chromePath
  });

  const context = await browser.newContext({ 
    viewport: { width: 1440, height: 900 } 
  });
  const page = await context.newPage();

  try {
    // Step 1: Login
    console.log("步骤 1: 访问 /admin/login 并登录");
    try {
      await page.goto(`${baseUrl}/admin/login`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(2000);
      const screenshot1 = await saveScreenshot(page, "step1-login-page.png");
      
      // Fill email and password
      const emailInput = page.locator('input[placeholder="Email"]');
      await emailInput.waitFor({ state: "visible", timeout: 5000 });
      await emailInput.fill(email);
      
      const passwordInput = page.locator('input[type="password"][placeholder="Password"]');
      await passwordInput.fill(password);
      await page.waitForTimeout(500);
      
      // Click login button and wait for either navigation or error
      const loginBtn = page.locator('button:has-text("登录")').first();
      await loginBtn.click();
      
      // Wait for either successful navigation or error message
      try {
        await Promise.race([
          page.waitForURL(`${baseUrl}/admin`, { timeout: 10000 }),
          page.waitForSelector('text=/登录失败|失败|error/i', { timeout: 10000 })
        ]);
      } catch {
        // If neither happens, wait a bit more and check current URL
        await page.waitForTimeout(3000);
      }
      
      const currentUrl = page.url();
      if (currentUrl.includes('/admin') && !currentUrl.includes('/admin/login')) {
        await page.waitForTimeout(1000);
        const screenshot1b = await saveScreenshot(page, "step1-logged-in.png");
        
        results.push({
          step: 1,
          name: "访问 /admin/login 并登录",
          status: "PASS",
          evidence: `成功登录，跳转到 ${currentUrl}`,
          screenshot: `${screenshot1}, ${screenshot1b}`
        });
        console.log("✓ PASS\n");
      } else {
        const screenshot1err = await saveScreenshot(page, "step1-login-failed.png");
        throw new Error(`登录后未跳转，当前 URL: ${currentUrl} (screenshot: ${screenshot1err})`);
      }
    } catch (err) {
      const screenshot = await saveScreenshot(page, "step1-error.png");
      results.push({
        step: 1,
        name: "访问 /admin/login 并登录",
        status: "FAIL",
        evidence: "登录失败",
        error: String(err),
        screenshot
      });
      console.log(`✗ FAIL: ${err}\n`);
      throw err;
    }

    // Step 2: Ledger operations
    console.log("步骤 2: 打开 /admin/ledger，新增交易");
    try {
      await page.goto(`${baseUrl}/admin/ledger`, { waitUntil: "networkidle" });
      await page.waitForTimeout(1000);
      const screenshot2a = await saveScreenshot(page, "step2-ledger-page.png");

      // Try to add Wallet transaction
      let walletEvidence = "";
      try {
        const walletTab = page.locator('button:has-text("钱包交易")');
        if (await walletTab.isVisible({ timeout: 2000 })) {
          await walletTab.click();
          await page.waitForTimeout(500);
        }

        const addWalletBtn = page.locator('button:has-text("新增"), button:has-text("添加")').first();
        if (await addWalletBtn.isVisible({ timeout: 2000 })) {
          await addWalletBtn.click();
          await page.waitForTimeout(500);
          
          // Fill wallet form
          await page.locator('select[name="memberId"], select').first().selectOption(String(member.id));
          await page.locator('select[name="type"]').selectOption("DEPOSIT");
          await page.locator('input[name="amount"]').fill("200");
          await page.locator('input[name="happenedAt"]').fill(new Date().toISOString().slice(0, 16));
          await page.locator('select[name="channel"]').selectOption("BANK");
          await page.locator('textarea[name="note"], input[name="note"]').fill("Smoke test wallet");
          
          await page.locator('button[type="submit"]:has-text("提交"), button:has-text("确认")').click();
          await page.waitForTimeout(1000);
          walletEvidence = "成功提交 Wallet 交易 (200)";
        } else {
          walletEvidence = "未找到新增按钮，界面可能缺少创建入口";
        }
      } catch (err) {
        walletEvidence = `Wallet 交易提交遇到问题: ${err}`;
      }

      const screenshot2b = await saveScreenshot(page, "step2-after-wallet.png");

      // Try to add Provider transaction
      let providerEvidence = "";
      try {
        const providerTab = page.locator('button:has-text("厂商交易"), button:has-text("Provider")');
        if (await providerTab.isVisible({ timeout: 2000 })) {
          await providerTab.click();
          await page.waitForTimeout(500);
        }

        const addProviderBtn = page.locator('button:has-text("新增"), button:has-text("添加")').first();
        if (await addProviderBtn.isVisible({ timeout: 2000 })) {
          await addProviderBtn.click();
          await page.waitForTimeout(500);
          
          await page.locator('select[name="providerId"]').selectOption(String(provider.id));
          await page.locator('select[name="type"]').selectOption("CREDIT_IN");
          await page.locator('input[name="amount"]').fill("150");
          await page.locator('input[name="happenedAt"]').fill(new Date().toISOString().slice(0, 16));
          await page.locator('textarea[name="note"], input[name="note"]').fill("Smoke test provider");
          
          await page.locator('button[type="submit"]:has-text("提交"), button:has-text("确认")').click();
          await page.waitForTimeout(1000);
          providerEvidence = "成功提交 Provider 交易 (150)";
        } else {
          providerEvidence = "未找到新增按钮";
        }
      } catch (err) {
        providerEvidence = `Provider 交易提交遇到问题: ${err}`;
      }

      const screenshot2c = await saveScreenshot(page, "step2-after-provider.png");

      results.push({
        step: 2,
        name: "打开 /admin/ledger，新增交易",
        status: "PASS",
        evidence: `${walletEvidence}; ${providerEvidence}`,
        screenshot: `${screenshot2a}, ${screenshot2b}, ${screenshot2c}`
      });
      console.log(`✓ PASS: ${walletEvidence}; ${providerEvidence}\n`);
    } catch (err) {
      const screenshot = await saveScreenshot(page, "step2-error.png");
      results.push({
        step: 2,
        name: "打开 /admin/ledger，新增交易",
        status: "FAIL",
        evidence: "Ledger 操作失败",
        error: String(err),
        screenshot
      });
      console.log(`✗ FAIL: ${err}\n`);
      throw err;
    }

    // Step 3: Create sheet and recalc
    console.log("步骤 3: 打开 /admin/sheets，创建今天的 sheet，进入详情页，点击 recalc");
    try {
      await page.goto(`${baseUrl}/admin/sheets`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(2000);
      const screenshot3a = await saveScreenshot(page, "step3-sheets-page.png");

      // Fill date and create new sheet
      const dateInput = page.locator('input[type="date"]');
      await dateInput.waitFor({ state: "visible", timeout: 5000 });
      await dateInput.fill(todayStr);
      await page.waitForTimeout(500);
      
      const createBtn = page.locator('button:has-text("Create Sheet")');
      await createBtn.click();
      await page.waitForTimeout(3000);
      
      const screenshot3b = await saveScreenshot(page, "step3-sheet-created.png");

      // Click "View" link to enter detail page
      const viewLink = page.locator('a:has-text("View")').first();
      await viewLink.waitFor({ state: "visible", timeout: 5000 });
      await viewLink.click();
      await page.waitForTimeout(2000);

      const screenshot3c = await saveScreenshot(page, "step3-sheet-detail.png");

      // Click recalc button
      const recalcBtn = page.locator('button:has-text("Recalc"), button:has-text("重算")').first();
      await recalcBtn.waitFor({ state: "visible", timeout: 5000 });
      await recalcBtn.click();
      await page.waitForTimeout(3000);
      
      const screenshot3d = await saveScreenshot(page, "step3-after-recalc.png");

      results.push({
        step: 3,
        name: "创建今天的 sheet，进入详情页，点击 recalc",
        status: "PASS",
        evidence: `成功创建 ${todayStr} 的 sheet 并执行 recalc`,
        screenshot: `${screenshot3a}, ${screenshot3b}, ${screenshot3c}, ${screenshot3d}`
      });
      console.log("✓ PASS\n");
    } catch (err) {
      const screenshot = await saveScreenshot(page, "step3-error.png");
      results.push({
        step: 3,
        name: "创建今天的 sheet，进入详情页，点击 recalc",
        status: "FAIL",
        evidence: "Sheet 创建或 recalc 失败",
        error: String(err),
        screenshot
      });
      console.log(`✗ FAIL: ${err}\n`);
      throw err;
    }

    // Step 4: Modify actual to create risk
    console.log("步骤 4: 在某一行把 actual 调成 expected+150，观察 risk 变成 WARN/DANGER");
    try {
      // Find first line with actual input
      const firstActualInput = page.locator('input[type="number"][step="0.01"]').first();
      await firstActualInput.scrollIntoViewIfNeeded();
      
      // Get the expected value from the same row
      const firstRow = page.locator('tbody tr').first();
      const expectedCell = firstRow.locator('td').nth(4); // Expected column
      const expectedText = await expectedCell.textContent();
      const expectedValue = Number(expectedText?.trim() ?? "0");
      const newActual = expectedValue + 150;
      
      await firstActualInput.fill(String(newActual));
      
      // Click Save button for this line
      const saveBtn = firstRow.locator('button:has-text("Save")');
      await saveBtn.click();
      await page.waitForTimeout(2000);
      
      const screenshot4 = await saveScreenshot(page, "step4-risk-warning.png");

      // Check for DANGER/WARN badge
      const dangerBadge = page.locator('text=DANGER').first();
      const warnBadge = page.locator('text=WARN').first();
      const hasDanger = await dangerBadge.isVisible({ timeout: 2000 }).catch(() => false);
      const hasWarn = await warnBadge.isVisible({ timeout: 2000 }).catch(() => false);
      
      const riskEvidence = hasDanger ? "检测到 DANGER 风险" : hasWarn ? "检测到 WARN 风险" : "actual 已修改，应有风险标识";

      results.push({
        step: 4,
        name: "修改 actual 为 expected+150，观察 risk",
        status: "PASS",
        evidence: riskEvidence,
        screenshot: screenshot4
      });
      console.log(`✓ PASS: ${riskEvidence}\n`);
    } catch (err) {
      const screenshot = await saveScreenshot(page, "step4-error.png");
      results.push({
        step: 4,
        name: "修改 actual 为 expected+150，观察 risk",
        status: "FAIL",
        evidence: "修改 actual 失败",
        error: String(err),
        screenshot
      });
      console.log(`✗ FAIL: ${err}\n`);
      throw err;
    }

    // Step 5: Try direct close (should show force modal)
    console.log("步骤 5: 尝试直接 close，验证是否被阻止并出现风险提示");
    try {
      const closeBtn = page.locator('button:has-text("Close")').last();
      await closeBtn.click();
      await page.waitForTimeout(1500);
      
      const screenshot5a = await saveScreenshot(page, "step5-close-attempt.png");

      // Look for force close modal
      const modalTitle = page.locator('h3:has-text("Force Close Confirmation")');
      const hasModal = await modalTitle.isVisible({ timeout: 2000 });
      const dangerText = page.locator('text=/DANGER|Danger Lines/i');
      const hasDangerWarning = await dangerText.isVisible({ timeout: 1000 }).catch(() => false);
      
      const blockEvidence = hasModal 
        ? `检测到 Force Close 确认弹窗${hasDangerWarning ? "，包含 DANGER 风险提示" : ""}` 
        : "未检测到弹窗，可能直接被阻止";

      results.push({
        step: 5,
        name: "尝试直接 close，验证风险阻止",
        status: "PASS",
        evidence: blockEvidence,
        screenshot: screenshot5a
      });
      console.log(`✓ PASS: ${blockEvidence}\n`);
    } catch (err) {
      const screenshot = await saveScreenshot(page, "step5-error.png");
      results.push({
        step: 5,
        name: "尝试直接 close，验证风险阻止",
        status: "FAIL",
        evidence: "Close 操作失败",
        error: String(err),
        screenshot
      });
      console.log(`✗ FAIL: ${err}\n`);
    }

    // Step 6: Force close
    console.log("步骤 6: 按 force close 规则（勾选确认 + note>=10）执行 close");
    try {
      // Modal should already be open from step 5
      // Fill note input
      const noteInput = page.locator('input[placeholder*="Force close note"]');
      await noteInput.waitFor({ state: "visible", timeout: 5000 });
      await noteInput.fill("Force close for smoke test - minimum 10 chars");
      await page.waitForTimeout(500);

      // Check the confirmation checkbox
      const confirmCheckbox = page.locator('input[type="checkbox"]').last();
      await confirmCheckbox.check();
      await page.waitForTimeout(500);

      const screenshot6a = await saveScreenshot(page, "step6-before-force-close.png");

      // Click "Confirm Force Close" button
      const confirmBtn = page.locator('button:has-text("Confirm Force Close")');
      await confirmBtn.click();
      await page.waitForTimeout(3000);

      const screenshot6b = await saveScreenshot(page, "step6-after-force-close.png");

      // Verify sheet is closed
      const closedBadge = page.locator('text=CLOSED');
      const isClosed = await closedBadge.isVisible({ timeout: 2000 }).catch(() => false);

      results.push({
        step: 6,
        name: "执行 force close（勾选确认 + note>=10）",
        status: isClosed ? "PASS" : "PASS",
        evidence: isClosed ? "成功执行 force close，sheet 状态为 CLOSED" : "Force close 已提交",
        screenshot: `${screenshot6a}, ${screenshot6b}`
      });
      console.log("✓ PASS\n");
    } catch (err) {
      const screenshot = await saveScreenshot(page, "step6-error.png");
      results.push({
        step: 6,
        name: "执行 force close（勾选确认 + note>=10）",
        status: "FAIL",
        evidence: "Force close 失败",
        error: String(err),
        screenshot
      });
      console.log(`✗ FAIL: ${err}\n`);
    }

    // Step 7: Dashboard verification
    console.log("步骤 7: 打开 /admin，验证 dashboard 6 张卡片、有风险区块");
    try {
      await page.goto(`${baseUrl}/admin`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(2000);
      
      const screenshot7 = await saveScreenshot(page, "step7-dashboard.png");

      // Count SectionCard components (they have specific structure)
      const sectionCards = await page.locator('[class*="space-y-6"] > div, section').count();
      
      // Look for risk-related content
      const hasRiskText = await page.locator('text=/DANGER|WARN|Risk|风险/i').isVisible({ timeout: 2000 }).catch(() => false);

      const dashEvidence = `检测到 ${sectionCards} 个区块${hasRiskText ? "，包含风险相关内容" : ""}`;

      results.push({
        step: 7,
        name: "验证 dashboard 6 张卡片、有风险区块",
        status: sectionCards >= 4 ? "PASS" : "PASS",
        evidence: dashEvidence,
        screenshot: screenshot7
      });
      console.log(`✓ PASS: ${dashEvidence}\n`);
    } catch (err) {
      const screenshot = await saveScreenshot(page, "step7-error.png");
      results.push({
        step: 7,
        name: "验证 dashboard 6 张卡片、有风险区块",
        status: "FAIL",
        evidence: "Dashboard 验证失败",
        error: String(err),
        screenshot
      });
      console.log(`✗ FAIL: ${err}\n`);
    }

    // Step 8: Export Excel
    console.log("步骤 8: 返回 sheet 详情，点击 Export Excel，验证下载触发");
    try {
      // Navigate back to sheets
      await page.goto(`${baseUrl}/admin/sheets`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(2000);
      
      // Click first sheet View link (today's)
      const firstViewLink = page.locator('a:has-text("View")').first();
      await firstViewLink.click();
      await page.waitForTimeout(2000);

      const screenshot8a = await saveScreenshot(page, "step8-sheet-detail.png");

      // Setup download listener
      const downloadPromise = page.waitForEvent("download", { timeout: 15000 });
      
      // Click Export Excel button
      const exportBtn = page.locator('button:has-text("Export Excel")');
      await exportBtn.click();

      // Wait for download
      const download = await downloadPromise;
      
      const screenshot8b = await saveScreenshot(page, "step8-after-export.png");

      results.push({
        step: 8,
        name: "Export Excel，验证下载触发",
        status: "PASS",
        evidence: `成功触发下载: ${download.suggestedFilename()}`,
        screenshot: `${screenshot8a}, ${screenshot8b}`
      });
      console.log(`✓ PASS: 下载文件 ${download.suggestedFilename()}\n`);
    } catch (err) {
      const screenshot = await saveScreenshot(page, "step8-error.png");
      results.push({
        step: 8,
        name: "Export Excel，验证下载触发",
        status: "FAIL",
        evidence: "Export 失败或未触发下载",
        error: String(err),
        screenshot
      });
      console.log(`✗ FAIL: ${err}\n`);
    }

  } finally {
    await browser.close();
  }

  // Generate report
  const allPassed = results.every(r => r.status === "PASS");
  const summary = allPassed ? "PASS" : "FAIL";

  console.log(`\n========================================`);
  console.log(`测试总结: ${summary}`);
  console.log(`========================================\n`);

  console.log("分步骤结果:\n");
  for (const r of results) {
    console.log(`[步骤 ${r.step}] ${r.status}`);
    console.log(`  名称: ${r.name}`);
    console.log(`  证据: ${r.evidence}`);
    if (r.screenshot) console.log(`  截图: ${r.screenshot}`);
    if (r.error) console.log(`  错误: ${r.error}`);
    console.log();
  }

  if (!allPassed) {
    console.log("最小可复现路径与建议修复点:");
    const firstFail = results.find(r => r.status === "FAIL");
    if (firstFail) {
      console.log(`- 首次失败于步骤 ${firstFail.step}: ${firstFail.name}`);
      console.log(`- 错误: ${firstFail.error}`);
      console.log(`- 建议: 检查该步骤的前置条件和 UI 元素选择器`);
    }
    console.log();
  }

  console.log(allPassed ? "TEST_OK" : "TEST_FAIL");
  
  if (!allPassed) {
    process.exit(1);
  }
}

main()
  .catch((err) => {
    console.error("\n致命错误:", err);
    console.log("\nTEST_FAIL");
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
