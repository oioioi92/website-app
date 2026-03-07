# UI Baseline Lock

**状态：UI_BASELINE_LOCKED**

当前版本（FINAL_UI_QA_OK 通过后）为正式基线，主结构不再随意改动。

---

## 规则

1. **不推翻 UI 结构**  
   布局、模块顺序、整体信息架构保持稳定。

2. **不随意改 spacing / radius / layout**  
   已统一的 container（16px）、section gap（16px）、card radius（16/20）、按钮高度等视为基线，不无理由修改。

3. **后续只允许**  
   - 内容替换（文案、图片、链接）  
   - 图片优化（尺寸建议、裁切、加载）  
   - 小范围 polish（颜色微调、字重、不影响布局的细节）  
   - 新功能接入（在现有结构上扩展，不破坏既有模块）

4. **若要改 UI**  
   必须先说明**为什么要改**，再动主结构；禁止无说明的随意改动。

---

## 基线参考

- 手机首页：`components/vivid/VividMobileHome.tsx`  
- 设计规范：Dark Luxury / Purple Premium / 统一 container·间距·圆角·图片比例  
- 后台图片配置与前台一一对应，见 `components/admin/ThemeSettingsClient.tsx`

---

*锁定日期：FINAL_UI_QA 通过后*
