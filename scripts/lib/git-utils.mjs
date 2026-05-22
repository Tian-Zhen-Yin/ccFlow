// scripts/lib/git-utils.mjs
import { execSync } from 'node:child_process';

/**
 * 检查工作区是否干净。
 * 返回 { clean: boolean, dirtyFiles: string[], error?: string }
 */
export function checkWorkingTree() {
  try {
    const output = execSync('git status --porcelain', { encoding: 'utf-8', cwd: process.cwd() });
    const lines = output.trim().split('\n').filter(Boolean);
    return { clean: lines.length === 0, dirtyFiles: lines };
  } catch {
    return { clean: false, dirtyFiles: [], error: '不是 Git 仓库或 Git 不可用' };
  }
}

/**
 * 安全执行 git add + git commit。
 * 返回 { success: boolean, error?: string }
 */
export function safeCommit(files, message) {
  try {
    execSync(`git add -- "${files.replace(/"/g, '\\"')}"`, { encoding: 'utf-8', cwd: process.cwd(), stdio: 'pipe' });
    execSync(`git commit -m "${message.replace(/"/g, '\\"')}"`, { encoding: 'utf-8', cwd: process.cwd(), stdio: 'pipe' });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.stderr || err.message };
  }
}

/**
 * 尝试 git push，失败时返回错误信息，不抛出异常。
 * 返回 { success: boolean, error?: string }
 */
export function safePush() {
  try {
    execSync('git push', { encoding: 'utf-8', cwd: process.cwd(), stdio: 'pipe', timeout: 30000 });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.stderr || err.message };
  }
}
