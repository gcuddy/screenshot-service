import puppeteer from "puppeteer";
// import chromium from "@sparticuz/chromium";
// const local_path =
//   "/tmp/localChromium/chromium/mac_arm-1231896/chrome-mac/Chromium.app/Contents/MacOS/Chromium";

Bun.serve({
  async fetch(request, server) {
    const url = new URL(request.url);
    const u = url.searchParams.get("url");
    if (!u) {
      return new Response("No URL provided", { status: 400 });
    }
    try {
      const _u = new URL(u);
    } catch (e) {
      return new Response(`Invalid URL: ${e}`, { status: 400 });
    }
    const width = url.searchParams.get("width");
    const height = url.searchParams.get("height");

    // return new Response(
    //   JSON.stringify({
    //     url: u,
    //     width,
    //     height,
    //   }),
    //   { status: 200, headers: { "Content-Type": "application/json" } }
    // );

    try {
      const screenshot = await take_screenshot(u.toString(), width ? +width : undefined, height ? +height : undefined);
      return new Response(screenshot, {
        headers: {
          "Content-Type": "image/jpeg",
        },
        status: 200,
      });
    } catch (e) {
      console.error("Error taking screenshot", e);
      return new Response("Error taking screenshot", { status: 500 });
    }
  },
});

async function take_screenshot(url: string, width = 1829, height = 1829) {
  console.log("Taking screenshot of", url);

  // {
  //     args: chromium.args,
  //     defaultViewport: chromium.defaultViewport,
  //     executablePath: await chromium.executablePath('https://github.com/Sparticuz/chromium/releases/download/v119.0.0/chromium-v119.0.0-pack.tar'),
  //     headless: chromium.headless,
  //     dumpio: true,
  //     ignoreHTTPSErrors: true,
  //   }
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: "new",
    defaultViewport: {
      width,
      height,
      deviceScaleFactor: 1.4,
      // 1.4 * x = 2560
      // x = 2560 / 1.4
      // x = 1828.5714285714287
    },
  });

  const page = await browser.newPage();

//   await page.setViewport({
//     width: width,
//     height: height,
//   });

  const viewport = await page.viewport();
  console.log("Viewport", viewport);

  await page.setBypassCSP(true);
  await page.goto(url, {
    waitUntil: ["load"],
  });

  console.log("Screenshot of " + url + " at " + width + "x" + height);

  const results = await page.screenshot({
    type: "jpeg",
    quality: 85,
    // fullPage: true,
  });

  await page.close();
  await browser.close();
  return results;
}
