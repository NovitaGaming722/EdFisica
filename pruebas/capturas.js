/* Capturas de la v3. Uso: node capturas.js <url-base> <carpeta-salida>
   · 11 secciones a 1920×1080 (en su «parada») y a 390×844 (parte alta de cada sección)
   · secuencias de scroll a 1920×1080: concepto 1…4 e historia 1…4
   · historia: un reposo por cada hito (paso 1…6), para ver que no hay vecinos cortados ni árbol tras las tarjetas */
const fs = require('fs');
const PW = process.env.PW || '/Users/santiago/.hermes/hermes-agent/node_modules/playwright-core';
const { chromium } = require(PW);
const [BASE, OUT] = [process.argv[2], process.argv[3]];
const BRAVE = '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const IDS = ['portada', 'concepto', 'diferencias', 'historia', 'fisiologia', 'cuerpomente', 'tecnicas', 'respiracion', 'ambitos', 'cierre'];

async function open(browser, W, H, mobile) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, serviceWorkers: 'block', isMobile: !!mobile, hasTouch: !!mobile });
  const page = await ctx.newPage();
  await page.goto(BASE + '/index.html', { waitUntil: 'load' });
  await page.waitForFunction(() => document.documentElement.classList.contains('ready'));
  await sleep(1600);
  return { ctx, page };
}
const goY = async (page, y, wait) => {
  await page.evaluate((y) => { Relax.motion.cancel && Relax.motion.cancel(); window.scrollTo(0, y); Relax.motion.snap(); }, Math.round(y));
  await sleep(wait || 2000);
};
const shot = async (page, name) => { await page.screenshot({ path: OUT + '/' + name }); process.stderr.write('.'); };

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: BRAVE, headless: true, args: ['--use-gl=angle', '--use-angle=metal', '--enable-webgl', '--ignore-gpu-blocklist'] });

  // ---------- 1920×1080 ----------
  {
    const { ctx, page } = await open(browser, 1920, 1080, false);
    const info = await page.evaluate(() => Relax.motion.secs.map((s, k) => ({ id: s.id, top: s.top, E: s.E, stop: Relax.motion.stopY(k) })));
    for (const id of IDS) {
      const s = info.find((x) => x.id === id);
      await page.evaluate((id) => { const st = Relax.stepper[id]; if (st && st.set) st.set(0, true); }, id);
      await goY(page, s.stop, 2300);
      await shot(page, '1920x1080-' + id + '.png');
    }
    // secuencia de concepto
    const c = info.find((x) => x.id === 'concepto');
    let n = 1;
    for (const q of [0.35, 0.9, 1.5, 2.0]) { await goY(page, c.top + q * 1080, 2300); await shot(page, '1920x1080-secuencia-concepto-' + n++ + '.png'); }
    // secuencia de historia: entrada · reposo del hito 2 · tránsito entre 3 y 4 · reposo del hito 6
    const h = info.find((x) => x.id === 'historia'); const k = info.findIndex((x) => x.id === 'historia');
    const pos = await page.evaluate((k) => { const st = Relax.stepper.historia; return Array.from({ length: st.n }, (_, i) => st.pos(i)); }, k);
    const seq = [h.top - 0.4 * 1080, pos[1], (pos[2] + pos[3]) / 2, pos[5]];
    n = 1;
    for (const y of seq) { await goY(page, y, 2300); await shot(page, '1920x1080-secuencia-historia-' + n++ + '.png'); }
    // un reposo por hito
    for (let i = 0; i < pos.length; i++) {
      await page.evaluate((i) => Relax.stepper.historia.set(i, true), i);
      await goY(page, pos[i], 2300);
      await shot(page, '1920x1080-historia-paso-' + (i + 1) + '.png');
    }
    await ctx.close();
  }
  // ---------- 390×844 ----------
  {
    const { ctx, page } = await open(browser, 390, 844, true);
    const info = await page.evaluate(() => Relax.motion.secs.map((s) => ({ id: s.id, top: s.top })));
    for (const id of IDS) {
      const s = info.find((x) => x.id === id);
      await goY(page, s.top, 700);
      await shot(page, '390x844-' + id + '.png');
    }
    await ctx.close();
  }
  await browser.close();
  console.log('\nlisto');
})().catch((e) => { console.error(e); process.exit(1); });
