#!/usr/bin/env node
// 记忆云恢复脚本（零依赖，任何装了 Node 的机器可跑）
// 用法：node unpack.mjs "<密码>"
// 作用：下载加密记忆包 → 密码解密 → 写入本机记忆目录 + 用户级 CLAUDE.md
// 密码错误：什么都不写入，直接报错退出
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import https from "node:https";
import crypto from "node:crypto";

const ENC_URL = "https://raw.githubusercontent.com/Ysn12121/ysn-memory/main/memory-pack.enc";
const HOME = os.homedir();
const password = process.argv[2] || "";

function download(url, redirects) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "claude-memory-unpack" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && (redirects || 0) < 5) {
          return download(res.headers.location, (redirects || 0) + 1).then(resolve, reject);
        }
        if (res.statusCode !== 200) return reject(new Error("下载失败 HTTP " + res.statusCode));
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      })
      .on("error", reject);
  });
}

const buf = fs.existsSync("memory-pack.enc")
  ? fs.readFileSync("memory-pack.enc")
  : await download(ENC_URL);
const magic = buf.subarray(0, 7).toString();
if (magic !== "YSNMEM1") {
  console.error("不是有效的记忆包文件");
  process.exit(1);
}
const salt = buf.subarray(7, 23);
const iv = buf.subarray(23, 35);
const tag = buf.subarray(35, 51);
const enc = buf.subarray(51);
let key;
try {
  key = crypto.scryptSync(password, salt, 32, { N: 131072, r: 8, p: 1, maxmem: 256 * 1024 * 1024 });
} catch (e) {
  console.error("解密失败：内存不足");
  process.exit(1);
}
const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
decipher.setAuthTag(tag);
let payload;
try {
  payload = Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
} catch (e) {
  console.error("密码错误，解密失败——什么都不会写入");
  process.exit(1);
}
const data = JSON.parse(payload);

// 写本机记忆目录：优先当前项目目录，兜底最新项目目录，再兜底 restored
const projectsRoot = path.join(HOME, ".claude", "projects");
let projDir = process.env.CLAUDE_PROJECT_DIR || "";
if (projDir && !fs.existsSync(projDir)) projDir = "";
if (!projDir && fs.existsSync(projectsRoot)) {
  const dirs = fs.readdirSync(projectsRoot).filter((d) => d !== "AGENT");
  let best = null;
  let bestT = 0;
  for (const d of dirs) {
    try {
      const t = fs.statSync(path.join(projectsRoot, d)).mtimeMs;
      if (t > bestT) {
        bestT = t;
        best = path.join(projectsRoot, d);
      }
    } catch {}
  }
  projDir = best || "";
}
if (!projDir) projDir = path.join(projectsRoot, "restored");
const memDir = path.join(projDir, "memory");
fs.mkdirSync(memDir, { recursive: true });
for (const [name, content] of Object.entries(data.files)) {
  fs.writeFileSync(path.join(memDir, name), content, "utf8");
}
if (data.claudeMd) {
  fs.writeFileSync(path.join(HOME, ".claude", "CLAUDE.md"), data.claudeMd, "utf8");
}
console.log(
  "记忆已恢复：" +
    Object.keys(data.files).length +
    " 个记忆文件 → " +
    memDir +
    "；用户级 CLAUDE.md 已写入。记忆打包时间：" +
    data.at
);
