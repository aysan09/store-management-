export default async function run(page, ui) {
  // Wait for the loading gate to hand off to the hero before shooting.
  await page.waitForSelector('.hero', { timeout: 20000 });
  await page.waitForTimeout(2500); // let entrance animations settle
  return { heroMounted: true, text: (await page.evaluate(() => document.body.innerText)).slice(0, 80) };
}