// Renders the 1200x630 social preview image from the white logo. Run after replacing the logo. Requires Playwright.
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const logo = 'data:image/png;base64,' + fs.readFileSync('public/logo/logo-white.png').toString('base64');
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await p.setContent(`<body style="margin:0;width:1200px;height:630px;background:linear-gradient(125deg,#1B3A78,#254C9C 52%,#2F78BD);font-family:Poppins;color:#fff;position:relative;overflow:hidden"><div style="position:absolute;right:-150px;top:-200px;width:620px;height:620px;border:84px solid rgba(91,193,230,.16);border-radius:50%;box-sizing:border-box"></div><img src="${logo}" style="position:absolute;left:80px;top:70px;height:170px"><div style="position:absolute;left:80px;top:290px;width:980px;font-size:64px;font-weight:700;line-height:1.14">Get paid for the care you already deliver.</div><div style="position:absolute;left:80px;top:500px;font-size:30px;font-weight:500">Medical billing and revenue cycle management</div></body>`);
  await p.waitForTimeout(200);
  await p.screenshot({ path: 'public/images/og-image.jpg', type: 'jpeg', quality: 82 });
  await b.close();
})();
