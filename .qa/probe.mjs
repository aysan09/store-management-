export default async function run(page, ui) {
  const snap = () => ({
    loadingVisible: !!document.querySelector('.loading-page'),
    heroMounted: !!document.querySelector('.hero'),
    bodyChars: document.body.innerText.trim().length,
  });

  // Sample the DOM over 12s to see whether the loader ever yields to the app.
  const samples = [];
  for (let i = 0; i < 6; i++) {
    samples.push({ t: i * 2, ...(await page.evaluate(snap)) });
    await page.waitForTimeout(2000);
  }
  return { samples, finalText: (await page.evaluate(() => document.body.innerText)).slice(0, 120) };
}