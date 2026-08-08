#!/usr/bin/env node
/**
 * MEDICAL O — Ad Studio renderer
 * HTML 템플릿을 픽셀 단위로 렌더링해 광고 소재(PNG/JPG)로 출력한다.
 *
 * 사용법:
 *   node render.js templates/pigment-feed.html            # out/<이름>.png
 *   node render.js templates/pigment-feed.html -o out/a.png --scale 2
 *   node render.js templates/story.html --format jpg --quality 92
 *
 * 템플릿 규약:
 *   - 캔버스는 #stage 요소. width/height 는 템플릿 CSS 에 고정 px 로 선언.
 *   - 렌더러는 #stage 의 bounding box 만 잘라서 저장한다.
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright-core');

const args = process.argv.slice(2);
if (!args.length) {
  console.error('usage: node render.js <template.html> [-o out.png] [--scale N] [--format png|jpg] [--quality N]');
  process.exit(1);
}
const file = path.resolve(args[0]);
const opt = (name, dflt) => {
  const i = args.indexOf(name);
  return i > -1 ? args[i + 1] : dflt;
};
const scale = parseFloat(opt('--scale', '2'));
const format = opt('--format', 'png');
const quality = parseInt(opt('--quality', '95'), 10);
const outPath = path.resolve(
  opt('-o', path.join(__dirname, 'out', path.basename(file, '.html') + '.' + format))
);

(async () => {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium',
    args: ['--force-color-profile=srgb', '--font-render-hinting=none'],
  });
  const page = await browser.newPage({ deviceScaleFactor: scale, viewport: { width: 1600, height: 2000 } });
  await page.goto('file://' + file, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150); // 폰트/이미지 안정화

  const stage = page.locator('#stage');
  const shot = { path: outPath, type: format === 'jpg' ? 'jpeg' : 'png' };
  if (shot.type === 'jpeg') shot.quality = quality;
  await stage.screenshot(shot);
  await browser.close();

  const box = fs.statSync(outPath);
  console.log(`rendered ${outPath} (${(box.size / 1024).toFixed(0)} KB, scale ${scale}x)`);
})();
