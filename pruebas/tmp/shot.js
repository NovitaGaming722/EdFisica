const { chromium } = require('/Users/santiago/.hermes/hermes-agent/node_modules/playwright-core');
(async () => {
  const [W,H,BASE,sec,s,out]=[+process.argv[2],+process.argv[3],process.argv[4],process.argv[5],+process.argv[6],process.argv[7]];
  const b = await chromium.launch({ executablePath: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser', headless: true, args: ['--use-gl=angle','--use-angle=metal','--enable-webgl','--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, serviceWorkers: 'block' });
  const p = await ctx.newPage();
  await p.goto(BASE + '/index.html'); await p.waitForFunction(() => document.documentElement.classList.contains('ready')); await p.waitForTimeout(1500);
  await p.addStyleTag({ content: 'html.__cv main,html.__cv main *,html.__cv .chrome,html.__cv .chrome *,html.__cv .rail,html.__cv .rail *,html.__cv .progress,html.__cv .progress *,html.__cv .bg,html.__cv .bg *,html.__cv .bg-glow,html.__cv .overlay,html.__cv .skip{visibility:hidden!important} html.__cv main,html.__cv .chrome,html.__cv .rail,html.__cv .progress,html.__cv .bg,html.__cv .bg-glow,html.__cv .overlay{opacity:0!important} html.__cv{background:#000!important} html.__cv *{transition:none!important;animation:none!important}' });
  await p.evaluate(([id,s]) => { const m=Relax.motion; const k=m.secs.findIndex(x=>x.id===id); window.scrollTo(0, m.secs[k].top + s*m.vh); m.snap(); }, [sec,s]);
  await p.waitForTimeout(2200);
  await p.screenshot({ path: out.replace('.png','-full.png') });
  await p.evaluate(() => document.documentElement.classList.add('__cv')); await p.waitForTimeout(150);
  await p.screenshot({ path: out });
  await b.close();
})();
