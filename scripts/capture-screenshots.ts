/**
 * 截图脚本：需先启动本地服务（npm run dev 或 npm run start），
 * 再在另一终端执行 npm run screenshots:capture。
 */
import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { chromium } from "playwright-core";

const baseUrl =
  process.env.CAPTURE_BASE_URL ||
  process.env.SMOKE_BASE_URL ||
  "http://localhost:3000";
const screenshotDir = path.join(process.cwd(), "screenshots");
const email = process.env.ADMIN_SEED_EMAIL ?? "admin@example.com";
const password = process.env.ADMIN_SEED_PASSWORD ?? "change_me_123";
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function ensureDir() {
  await fs.mkdir(screenshotDir, { recursive: true });
}

async function main() {
  await ensureDir();

  const browser = await chromium.launch({
    headless: true,
    executablePath: chromePath
  });

  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const desktopPage = await desktop.newPage();
  await desktopPage.emulateMedia({ reducedMotion: "reduce" });

  await desktopPage.goto(baseUrl, { waitUntil: "networkidle" });
  await desktopPage.screenshot({
    path: path.join(screenshotDir, "home-desktop-final.png"),
    fullPage: true
  });
  await desktopPage.screenshot({
    path: path.join(screenshotDir, "home_desktop.png"),
    fullPage: true
  });
  await desktopPage.screenshot({
    path: path.join(screenshotDir, "desktop_fold1.png"),
    fullPage: false
  });
  await desktopPage.screenshot({
    path: path.join(screenshotDir, "desktop_home_fold1.png"),
    fullPage: false
  });
  await desktopPage.screenshot({
    path: path.join(screenshotDir, "desktop_promo_expanded.png"),
    fullPage: false
  });
  await desktopPage.screenshot({
    path: path.join(screenshotDir, "home-desktop-3col-final.png"),
    fullPage: false
  });
  await desktopPage.screenshot({
    path: path.join(screenshotDir, "desktop-3col-v4.png"),
    fullPage: false
  });
  try {
    await desktopPage.waitForSelector('[data-testid="v3-sliding-promo"]', { state: "visible", timeout: 3000 });
  } catch {
    // V3 not enabled or not loaded in time
  }
  const v3Promo = desktopPage.locator('[data-testid="v3-sliding-promo"]').first();
  if (await v3Promo.count()) {
    await desktopPage.evaluate(() => window.scrollTo(0, 0));
    await desktopPage.waitForTimeout(300);
    await desktopPage.screenshot({
      path: path.join(screenshotDir, "home_top_marquee_promo_liveTx_desktop.png"),
      fullPage: false
    });
    const v3LiveTx = desktopPage.locator('[data-testid="v3-livetx-section"]').first();
    if (await v3LiveTx.count()) {
      await v3LiveTx.scrollIntoViewIfNeeded();
      await desktopPage.waitForTimeout(200);
      await desktopPage.screenshot({
        path: path.join(screenshotDir, "home_livetx_actionbar_desktop.png"),
        fullPage: false
      });
    }
    const v3ActionBar = desktopPage.locator('[data-testid="v3-action-bar"]').first();
    if (await v3ActionBar.count()) {
      await v3ActionBar.scrollIntoViewIfNeeded();
      await desktopPage.waitForTimeout(200);
      await v3ActionBar.screenshot({
        path: path.join(screenshotDir, "home_actionbar_desktop.png")
      });
    }
  }
  const footer = desktopPage.locator("footer").first();
  if (await footer.count()) {
    await footer.scrollIntoViewIfNeeded();
    await desktopPage.waitForTimeout(300);
    await desktopPage.screenshot({
      path: path.join(screenshotDir, "desktop-footer-v4.png"),
      fullPage: false
    });
  }
  const modulesSection = desktopPage.locator("#control-tower-modules").first();
  if (await modulesSection.count()) {
    await modulesSection.scrollIntoViewIfNeeded();
    await desktopPage.waitForTimeout(300);
    await desktopPage.screenshot({
      path: path.join(screenshotDir, "desktop_home_fold2.png"),
      fullPage: false
    });
    await desktopPage.screenshot({
      path: path.join(screenshotDir, "desktop_fold2.png"),
      fullPage: false
    });
  }
  const desktopLiveTx = desktopPage.locator('[data-testid="live-transaction-section"]:visible').first();
  if (await desktopLiveTx.count()) {
    await desktopLiveTx.scrollIntoViewIfNeeded();
    await desktopPage.waitForTimeout(300);
    await desktopPage.screenshot({
      path: path.join(screenshotDir, "live_transactions_desktop.png"),
      fullPage: false
    });
  }
  await desktopPage.screenshot({
    path: path.join(screenshotDir, "desktop_livetx_visible.png"),
    fullPage: false
  });
  let desktopGameGrid = desktopPage.locator('[data-testid="desktop-game-grid"]:visible').first();
  if ((await desktopGameGrid.count()) === 0) {
    desktopGameGrid = desktopPage.locator('[data-testid="game-grid"]:visible').first();
  }
  if (await desktopGameGrid.count()) {
    await desktopGameGrid.scrollIntoViewIfNeeded();
    await desktopPage.waitForTimeout(300);
  }
  await desktopPage.screenshot({
    path: path.join(screenshotDir, "desktop_game_logo_only.png"),
    fullPage: false
  });
  const promoShowcase = desktopPage.locator("#promotion-showcase:visible").first();
  if (await promoShowcase.count()) {
    await promoShowcase.scrollIntoViewIfNeeded();
    await desktopPage.waitForTimeout(300);
    const firstPromoTile = desktopPage.locator('[data-testid="promotion-tile"]').first();
    if (await firstPromoTile.count()) {
      await firstPromoTile.click();
      await desktopPage.waitForTimeout(500);
      await desktopPage.screenshot({
        path: path.join(screenshotDir, "promotion_expanded_desktop.png"),
        fullPage: false
      });
    }
  }
  const firstPromo = desktopPage.locator('[data-testid="promo-card"]:visible').first();
  if (await firstPromo.count()) {
    await firstPromo.click();
    await desktopPage.waitForTimeout(500);
    await desktopPage.screenshot({
      path: path.join(screenshotDir, "home-promo-modal-final.png"),
      fullPage: true
    });
    await desktopPage.keyboard.press("Escape");
  }
  const socialSection = desktopPage.locator('[data-testid="social-section"]:visible').first();
  if (await socialSection.count()) {
    await socialSection.scrollIntoViewIfNeeded();
    await desktopPage.waitForTimeout(300);
    await desktopPage.screenshot({
      path: path.join(screenshotDir, "home-social-final.png"),
      fullPage: true
    });
  }

  try {
    await desktopPage.goto(`${baseUrl}/admin/login`, { waitUntil: "networkidle" });
    await desktopPage.screenshot({
      path: path.join(screenshotDir, "admin-login-final.png"),
      fullPage: true
    });

    await desktopPage.getByPlaceholder("Email").fill(email);
    await desktopPage.getByPlaceholder("Password").fill(password);
    await desktopPage.getByRole("button", { name: "登录" }).click();
    await desktopPage.waitForURL(`${baseUrl}/admin`, { timeout: 15000 });

    await desktopPage.goto(`${baseUrl}/admin/promotions`, { waitUntil: "networkidle" });
    await desktopPage.screenshot({
      path: path.join(screenshotDir, "admin-promotions-final.png"),
      fullPage: true
    });

    await desktopPage.goto(`${baseUrl}/admin/audit`, { waitUntil: "networkidle" });
    await desktopPage.screenshot({
      path: path.join(screenshotDir, "admin-audit-final.png"),
      fullPage: true
    });
  } catch (err) {
    console.warn("ADMIN_SCREENSHOTS_SKIPPED", err instanceof Error ? err.message : String(err));
  }

  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
  });
  const mobilePage = await mobile.newPage();
  await mobilePage.emulateMedia({ reducedMotion: "reduce" });
  await mobilePage.goto(baseUrl, { waitUntil: "networkidle" });
  await mobilePage.screenshot({
    path: path.join(screenshotDir, "mobile_top.png"),
    fullPage: false
  });
  await mobilePage.screenshot({
    path: path.join(screenshotDir, "home-mobile-final.png"),
    fullPage: true
  });
  await mobilePage.screenshot({
    path: path.join(screenshotDir, "home_mobile.png"),
    fullPage: true
  });
  await mobilePage.screenshot({
    path: path.join(screenshotDir, "mobile-home-v4.png"),
    fullPage: true
  });
  await mobilePage.screenshot({
    path: path.join(screenshotDir, "home-mobile-bottom-nav-final.png"),
    fullPage: false
  });
  const liveSection = mobilePage.locator('[data-testid="live-transaction-section"]:visible').first();
  if (await liveSection.count()) {
    await liveSection.scrollIntoViewIfNeeded();
    await mobilePage.waitForTimeout(300);
  }
  await mobilePage.screenshot({
    path: path.join(screenshotDir, "mobile_livetx_visible.png"),
    fullPage: false
  });
  await mobilePage.screenshot({
    path: path.join(screenshotDir, "mobile_live_games.png"),
    fullPage: false
  });
  const mobileGameGrid = mobilePage.locator('[data-testid="game-grid"]:visible').first();
  if (await mobileGameGrid.count()) {
    await mobileGameGrid.scrollIntoViewIfNeeded();
    await mobilePage.waitForTimeout(300);
  }
  await mobilePage.screenshot({
    path: path.join(screenshotDir, "mobile_game_logo_only.png"),
    fullPage: false
  });
  const mobilePromo = mobilePage.locator('[data-testid="promo-card"]').first();
  if (await mobilePromo.count()) {
    await mobilePromo.click();
    await mobilePage.waitForTimeout(500);
    await mobilePage.screenshot({
      path: path.join(screenshotDir, "home-mobile-promo-modal-final.png"),
      fullPage: false
    });
    await mobilePage.screenshot({
      path: path.join(screenshotDir, "mobile-promo-modal-v4.png"),
      fullPage: false
    });
    await mobilePage.keyboard.press("Escape");
  }
  await mobilePage.goto(`${baseUrl}/bonus`, { waitUntil: "networkidle" });
  await mobilePage.screenshot({
    path: path.join(screenshotDir, "mobile_bonus_accordion.png"),
    fullPage: true
  });
  await mobilePage.screenshot({
    path: path.join(screenshotDir, "bonus-mobile-final.png"),
    fullPage: true
  });
  await mobilePage.screenshot({
    path: path.join(screenshotDir, "mobile-bonus-v4.png"),
    fullPage: true
  });

  await mobile.close();
  await desktop.close();
  await browser.close();

  console.log("SCREENSHOTS_OK");
  console.log("screenshots/home-desktop-final.png");
  console.log("screenshots/home_desktop.png");
  console.log("screenshots/desktop_fold1.png");
  console.log("screenshots/desktop_fold2.png");
  console.log("screenshots/desktop_promo_expanded.png");
  console.log("screenshots/desktop_home_fold1.png");
  console.log("screenshots/desktop_home_fold2.png");
  console.log("screenshots/home-desktop-3col-final.png");
  console.log("screenshots/desktop-3col-v4.png");
  console.log("screenshots/home_top_marquee_promo_liveTx_desktop.png");
  console.log("screenshots/home_livetx_actionbar_desktop.png");
  console.log("screenshots/home_actionbar_desktop.png");
  console.log("screenshots/desktop-footer-v4.png");
  console.log("screenshots/desktop_game_logo_only.png");
  console.log("screenshots/desktop_livetx_visible.png");
  console.log("screenshots/home-mobile-final.png");
  console.log("screenshots/mobile_top.png");
  console.log("screenshots/mobile_live_games.png");
  console.log("screenshots/mobile_game_logo_only.png");
  console.log("screenshots/mobile_livetx_visible.png");
  console.log("screenshots/mobile_bonus_accordion.png");
  console.log("screenshots/home_mobile.png");
  console.log("screenshots/mobile-home-v4.png");
  console.log("screenshots/home-mobile-bottom-nav-final.png");
  console.log("screenshots/home-mobile-promo-modal-final.png");
  console.log("screenshots/mobile-promo-modal-v4.png");
  console.log("screenshots/bonus-mobile-final.png");
  console.log("screenshots/mobile-bonus-v4.png");
  console.log("screenshots/home-promo-modal-final.png");
  console.log("screenshots/home-social-final.png");
  console.log("screenshots/admin-login-final.png");
  console.log("screenshots/admin-promotions-final.png");
  console.log("screenshots/admin-audit-final.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
