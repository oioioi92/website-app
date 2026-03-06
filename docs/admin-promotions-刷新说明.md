# 后台优惠活动页面没有更新时的排查步骤

如果修改了「优惠活动」后台（参考站风格、分组表、Claim Config 等）但页面看起来和之前一样，按下面顺序检查。

## 1. 确认访问的地址

- 列表页（参考站风格表格）：**`/admin/promotions`**
- 编辑页（PROMOTION ID + Claim Config）：**`/admin/promotions/[某个id]/edit`**

侧栏「CONTENT → Promotions」点进去应进入列表页。

## 2. 强制刷新浏览器缓存

- **Windows**：`Ctrl + Shift + R` 或 `Ctrl + F5`
- **Mac**：`Cmd + Shift + R`

或：打开开发者工具 (F12) → 右键刷新按钮 → 选「清空缓存并硬性重新加载」。

## 3. 重启开发服务器并清掉 Next 缓存

在项目根目录执行：

```bash
# 删除 Next 构建缓存
rm -rf .next
# 或在 Windows PowerShell：
# Remove-Item -Recurse -Force .next

# 重新启动
npm run dev
```

等编译完成后，再打开 `/admin/promotions` 并强制刷新一次。

## 4. 如何确认新版本已加载

- **列表页**：页面顶部工具栏里应有一个下拉框「**参考站风格（分组+全列）** / **简洁列表**」，表格表头应包含「ID、Name、Action、Claim Condition、Amount、Max Payout…」等列；有数据时会出现金/红渐变的**分组条**（如「其他」）。
- **编辑页**：标题应为「**PROMOTION ID: xxx**」，页面最下方有「**Claim Config**」卡片并显示 JSON。

若仍看不到上述内容，请检查：

- 是否登录了后台（未登录时接口可能 401，列表为空或报错）。
- 浏览器控制台 (F12 → Console) 是否有报错。
- 网络请求 `/api/admin/promotions` 是否返回 200 以及是否包含 `ruleJson`、`percent` 字段。
