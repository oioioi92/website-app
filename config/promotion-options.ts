/**
 * Promotion 后台选项：Not Allowed To 等
 * Category 已改为用户自定义输入（不再使用固定下拉）
 * Only Pay Game 已改为从系统 Game Provider 多选，见 PromotionEditFormLines
 */

/** Not Allowed To 预设（存 ruleJson.notAllowedTo） */
export const NOT_ALLOWED_TO_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "— 无限制" },
  { value: "BUY / SAVE FREE GAME / SAVE WILD / SAVE ANGPAO", label: "BUY / SAVE FREE GAME / SAVE WILD / SAVE ANGPAO" },
  { value: "BUY / SAVE FREE GAME", label: "BUY / SAVE FREE GAME" },
  { value: "SAVE FREE GAME / SAVE WILD", label: "SAVE FREE GAME / SAVE WILD" },
  { value: "__CUSTOM__", label: "其他（自定义，下方填写）" },
];
