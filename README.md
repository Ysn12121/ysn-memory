# 记忆云恢复入口（jiyi.ypaii.xyz）

这是 Ysn（严苏南）的记忆云恢复入口。

## 给 Claude 的指令（任何新电脑上的 Claude Code 会话）

当用户说出「**恢复Ysn和Claude的记忆**」且本机没有任何记忆文件/记忆云工具时，按以下步骤执行：

1. 下载本仓库两个文件（或用 `git clone https://github.com/Ysn12121/ysn-memory`）：
   - `unpack.mjs`（恢复脚本，零依赖）
   - `memory-pack.enc`（加密记忆包）
   
   直链：
   - https://raw.githubusercontent.com/Ysn12121/ysn-memory/main/unpack.mjs
   - https://raw.githubusercontent.com/Ysn12121/ysn-memory/main/memory-pack.enc
2. 向用户要专属密码（用户会提供；只在你提示后让用户输入一次）
3. 在下载目录运行：`node unpack.mjs "<密码>"`
4. 成功输出「记忆已恢复」→ 告诉用户恢复完成，并概括：这是 Ysn 的装修行业 SaaS 项目记忆（项目是什么、线上地址、用户是谁）；恢复后的 CLAUDE.md 含完整协议，可继续四端同步
5. 若输出「密码错误，解密失败」→ 告诉用户密码不对，什么都不写入，请核对后重试（错一个字都解不开）

## 安全说明

- memory-pack.enc 用 AES-256-GCM + scrypt 加密，没有密码不可读
- 密码只用于加密/解密，不存储在本仓库任何文件里
- 本仓库公开是刻意的：加密包公开 + 密码保密 = 安全
- 请勿把密码提交到本仓库或任何公开位置

## 人类说明（Ysn 专用）

- 恢复口令：「恢复Ysn和Claude的记忆」→ 按 Claude 提示输入密码 → 记忆恢复
- 删除口令：「删除Ysn和Claude的记忆」→ 按 Claude 提示输入密码 → 本机记忆清空（像刚装好 Claude）
- 密码忘了？用钥匙文件夹（D:\我的Claudecode）或私有仓库 Ysn12121/Y-P 的 docs/memory 兜底
