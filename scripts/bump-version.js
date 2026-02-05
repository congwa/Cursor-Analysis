#!/usr/bin/env node

/**
 * 版本号管理脚本
 * 用法: node scripts/bump-version.js [patch|minor|major]
 * 默认: patch
 */

import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// 文件路径
const packageJsonPath = join(rootDir, 'package.json');
const tauriConfPath = join(rootDir, 'src-tauri', 'tauri.conf.json');
const cargoTomlPath = join(rootDir, 'src-tauri', 'Cargo.toml');

/**
 * 解析版本号
 * @param {string} version - 版本号字符串 (如 "1.0.0")
 * @returns {{ major: number, minor: number, patch: number }}
 */
function parseVersion(version) {
  const parts = version.split('.');
  return {
    major: parseInt(parts[0]) || 0,
    minor: parseInt(parts[1]) || 0,
    patch: parseInt(parts[2]) || 0,
  };
}

/**
 * 递增版本号
 * @param {string} version - 当前版本号
 * @param {'patch'|'minor'|'major'} type - 递增类型
 * @returns {string} 新版本号
 */
function bumpVersion(version, type = 'patch') {
  const v = parseVersion(version);
  
  switch (type) {
    case 'major':
      v.major++;
      v.minor = 0;
      v.patch = 0;
      break;
    case 'minor':
      v.minor++;
      v.patch = 0;
      break;
    case 'patch':
    default:
      v.patch++;
      break;
  }
  
  return `${v.major}.${v.minor}.${v.patch}`;
}

/**
 * 更新 package.json
 */
function updatePackageJson(newVersion) {
  const content = readFileSync(packageJsonPath, 'utf-8');
  const pkg = JSON.parse(content);
  const oldVersion = pkg.version;
  pkg.version = newVersion;
  writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n');
  console.log(`  package.json: ${oldVersion} -> ${newVersion}`);
}

/**
 * 更新 tauri.conf.json
 */
function updateTauriConf(newVersion) {
  const content = readFileSync(tauriConfPath, 'utf-8');
  const conf = JSON.parse(content);
  const oldVersion = conf.version;
  conf.version = newVersion;
  writeFileSync(tauriConfPath, JSON.stringify(conf, null, 2) + '\n');
  console.log(`  tauri.conf.json: ${oldVersion} -> ${newVersion}`);
}

/**
 * 更新 Cargo.toml
 */
function updateCargoToml(newVersion) {
  let content = readFileSync(cargoTomlPath, 'utf-8');
  const versionRegex = /^version\s*=\s*"([^"]+)"/m;
  const match = content.match(versionRegex);
  if (match) {
    const oldVersion = match[1];
    content = content.replace(versionRegex, `version = "${newVersion}"`);
    writeFileSync(cargoTomlPath, content);
    console.log(`  Cargo.toml: ${oldVersion} -> ${newVersion}`);
  }
}

// 主程序
function main() {
  const bumpType = process.argv[2] || 'patch';
  
  if (!['patch', 'minor', 'major'].includes(bumpType)) {
    console.error('用法: node scripts/bump-version.js [patch|minor|major]');
    process.exit(1);
  }
  
  // 读取当前版本（以 tauri.conf.json 为准）
  const tauriConf = JSON.parse(readFileSync(tauriConfPath, 'utf-8'));
  const currentVersion = tauriConf.version;
  const newVersion = bumpVersion(currentVersion, bumpType);
  
  console.log(`\n📦 版本升级: ${currentVersion} -> ${newVersion} (${bumpType})\n`);
  console.log('更新文件:');
  
  updatePackageJson(newVersion);
  updateTauriConf(newVersion);
  updateCargoToml(newVersion);
  
  console.log(`\n✅ 版本已更新为 ${newVersion}\n`);
}

main();
