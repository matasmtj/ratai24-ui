// Alternatyvus testų paleidimo būdas, apeinantis selenium-side-runner/Jest aplinkos problemas.
// Nuskaito carlease.side projektą ir įvykdo pagrindines komandas per selenium-webdriver.
// Paleidimas: npm run test:ui (arba node tests/ui/run-direct.mjs)

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import chromedriver from 'chromedriver';

const __dirname = dirname(fileURLToPath(import.meta.url));
const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
const sideFileArg = process.argv.find((a) => a.endsWith('.side'));
const sideFile = sideFileArg ? resolve(sideFileArg) : resolve(__dirname, 'carlease.side');
const project = JSON.parse(readFileSync(sideFile, 'utf8'));
console.log(`(naudojamas ${sideFile})`);

const filter = process.argv.find((a, i) => i > 1 && !a.endsWith('.side'));
const tests = filter
  ? project.tests.filter((t) => t.id.includes(filter) || t.name.includes(filter))
  : project.tests;

function parseSelector(target) {
  if (target.startsWith('css=')) return By.css(target.slice(4));
  if (target.startsWith('xpath=')) return By.xpath(target.slice(6));
  if (target.startsWith('id=')) return By.id(target.slice(3));
  if (target.startsWith('name=')) return By.name(target.slice(5));
  if (target.startsWith('linkText=')) return By.linkText(target.slice(9));
  return By.css(target);
}

function matchLocation(actual, expected) {
  if (expected.startsWith('glob:')) {
    const pattern = expected
      .slice(5)
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*');
    return new RegExp('^' + pattern + '$').test(actual);
  }
  if (expected.startsWith('regexp:')) {
    return new RegExp(expected.slice(7)).test(actual);
  }
  return actual.includes(expected);
}

async function runCommand(driver, cmd, vars) {
  const { command, target, value } = cmd;
  switch (command) {
    case 'open': {
      const url = target.startsWith('http') ? target : baseUrl + target;
      await driver.get(url);
      return;
    }
    case 'setWindowSize': {
      const [w, h] = target.split('x').map(Number);
      await driver.manage().window().setRect({ width: w, height: h });
      return;
    }
    case 'pause':
      await new Promise((r) => setTimeout(r, Number(target) || 0));
      return;
    case 'runScript':
      await driver.executeScript(target);
      return;
    case 'executeScript': {
      const result = await driver.executeScript(target);
      if (value) vars[value] = result;
      return;
    }
    case 'store':
      vars[value] = target;
      return;
    case 'assert':
    case 'verify': {
      const actual = vars[target];
      const expected = value;
      const actualStr = String(actual);
      if (actualStr !== String(expected)) {
        throw new Error(`${command}: kintamasis '${target}' = '${actualStr}', laukta '${expected}'`);
      }
      return;
    }
    case 'click':
      await driver.wait(until.elementLocated(parseSelector(target)), 10000);
      await driver.findElement(parseSelector(target)).click();
      return;
    case 'type': {
      const el = await driver.wait(until.elementLocated(parseSelector(target)), 10000);
      await el.clear();
      if (value) await el.sendKeys(value);
      return;
    }
    case 'sendKeys': {
      const el = await driver.wait(until.elementLocated(parseSelector(target)), 10000);
      if (value) await el.sendKeys(value);
      return;
    }
    case 'select': {
      const selectEl = await driver.wait(until.elementLocated(parseSelector(target)), 10000);
      if (value.startsWith('label=')) {
        const label = value.slice(6);
        const option = await selectEl.findElement(By.xpath(`.//option[normalize-space(.)='${label}']`));
        await option.click();
      } else if (value.startsWith('value=')) {
        const v = value.slice(6);
        const option = await selectEl.findElement(By.css(`option[value='${v}']`));
        await option.click();
      } else {
        const option = await selectEl.findElement(By.xpath(`.//option[normalize-space(.)='${value}']`));
        await option.click();
      }
      return;
    }
    case 'waitForElementVisible': {
      const el = await driver.wait(
        until.elementLocated(parseSelector(target)),
        Number(value) || 10000
      );
      await driver.wait(until.elementIsVisible(el), Number(value) || 10000);
      return;
    }
    case 'waitForElementPresent':
      await driver.wait(until.elementLocated(parseSelector(target)), Number(value) || 10000);
      return;
    case 'assertElementPresent': {
      const els = await driver.findElements(parseSelector(target));
      if (els.length === 0) throw new Error(`assertElementPresent: element not found: ${target}`);
      return;
    }
    case 'assertElementNotPresent': {
      const els = await driver.findElements(parseSelector(target));
      if (els.length > 0) throw new Error(`assertElementNotPresent: element IS present: ${target}`);
      return;
    }
    case 'assertLocation':
    case 'verifyLocation': {
      const actual = await driver.getCurrentUrl();
      if (!matchLocation(actual, target)) {
        throw new Error(`${command}: expected ${target}, got ${actual}`);
      }
      return;
    }
    case 'assertValue': {
      const el = await driver.findElement(parseSelector(target));
      const v = await el.getAttribute('value');
      if (v !== value) throw new Error(`assertValue: expected ${value}, got ${v}`);
      return;
    }
    case 'assertTitle': {
      const t = await driver.getTitle();
      if (t !== target) throw new Error(`assertTitle: expected ${target}, got ${t}`);
      return;
    }
    default:
      throw new Error(`Unsupported command: ${command}`);
  }
}

async function runTest(driver, test) {
  process.stdout.write(`▶  ${test.name} ... `);
  const start = Date.now();
  const vars = {};
  for (const cmd of test.commands) {
    try {
      await runCommand(driver, cmd, vars);
    } catch (err) {
      const ms = Date.now() - start;
      console.log(`FAIL (${ms} ms)`);
      console.log(`   ↳ komanda ${cmd.command} ${cmd.target || ''} → ${err.message}`);
      return false;
    }
  }
  console.log(`PASS (${Date.now() - start} ms)`);
  return true;
}

async function main() {
  const service = new chrome.ServiceBuilder(chromedriver.path);
  const options = new chrome.Options().addArguments(
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--window-size=1366,768'
  );
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeService(service)
    .setChromeOptions(options)
    .build();

  let passed = 0;
  let failed = 0;
  try {
    for (const test of tests) {
      const ok = await runTest(driver, test);
      if (ok) passed++;
      else failed++;
    }
  } finally {
    await driver.quit();
  }
  console.log(`\nSuvestinė: ${passed} praėjo, ${failed} nepraėjo (iš ${tests.length}).`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
