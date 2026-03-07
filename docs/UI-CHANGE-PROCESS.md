# UI 变更流程（UI Change Process）

在 **UI_BASELINE_LOCKED** 下，任何涉及 UI 结构、间距、圆角、布局的改动都必须按本流程执行。

---

## 规则

**若要改 UI，必须先说明，再提交。**

---

## 变更前必须回答的三点

在改代码或提 PR 前，必须写清（可在 PR 描述或 issue 中）：

1. **为什么改（Why）**  
   例如：业务要求、可访问性、数据展示需求、运营反馈。  
   禁止理由：「看着不顺」「想试试」等无依据改动。

2. **影响哪些组件（What）**  
   列出会改动的组件/文件，例如：  
   `VividMobileHome.tsx`、`HeroPromotionSlider`、`UnifiedBottomNav` 等。  
   见 `docs/UI-COMPONENT-MAP.md`。

3. **是否影响 Mobile / Desktop（Where）**  
   说明改动范围：仅手机、仅桌面、还是两者。  
   若两者都影响，需确认两端的表现一致或有意差异化。

---

## 推荐流程

1. **提出变更**  
   在 issue 或 PR 中写清上述三点（Why / What / Where）。

2. **评估**  
   确认是否违反 `docs/UI-BASELINE-LOCK.md`（如推翻主结构、随意改 spacing/radius）。

3. **实施**  
   若为允许范围内的改动（内容替换、小 polish、新功能接入），按现有规范改；若涉及主结构，需先达成共识再改。

4. **提交**  
   PR 描述中再次注明：变更原因、影响组件、Mobile/Desktop 范围。

5. **后台同步**  
   若涉及图片尺寸/比例/新图位，必须同步更新后台 Theme 配置与 `docs/IMAGE-GUIDELINES.md`（见 UI-BASELINE-LOCK 规则）。

---

## 禁止

- 无说明直接改 layout / spacing / radius。
- 只改前台不改后台（图片/文案配置）。
- 只改 Mobile 或只改 Desktop 导致两端不一致且无说明。

---

*与 `docs/UI-BASELINE-LOCK.md` 配套使用。*
