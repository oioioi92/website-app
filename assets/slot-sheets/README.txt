Slot 合成图（3x3 网格）请放在此目录，文件名需为：
  image-8d508ca7-4dfc-4bc4-9495-59dde5ec5829.png
  image-8053b31b-6852-46d0-98e6-9b4561173472.png
  image-cc4ad1ca-ea17-4e58-9fab-adc2b3fa5e4f.png
  image-4d037ff5-817e-4158-aef5-64bb383523c2.png
  image-077d35b3-f60c-498f-9d2b-380b8fdfba75.png
放好后在项目根目录执行： npx tsx scripts/extract-slot-logos.ts --overwrite
提取的 PNG 会输出到 public/assets/providers/ 并自动去除浅蓝底。
