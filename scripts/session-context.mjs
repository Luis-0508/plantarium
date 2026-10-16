// SessionStart hook: prints live git and board state so a new Claude Code
// session can reconcile docs/PROJECT_STATE.md with reality. Local reads only,
// no network, no dependencies; it never fails the session.
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

const git = (...args) => {
  try {
    return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 3000 }).trim()
  } catch {
    return ''
  }
}

const lines = ['## Live project context (SessionStart hook)', '']

const branch = git('branch', '--show-current') || '(detached)'
const counts = git('rev-list', '--left-right', '--count', 'origin/main...HEAD').split(/\s+/)
const sync = counts.length === 2 ? `, ${counts[1]} ahead / ${counts[0]} behind origin/main (as of last fetch)` : ''
lines.push(`Branch: ${branch}${sync}`)

const dirty = git('status', '--porcelain').split('\n').filter(Boolean)
lines.push(dirty.length ? `Uncommitted: ${dirty.length} file(s): ${dirty.slice(0, 8).map((l) => l.slice(3)).join(', ')}${dirty.length > 8 ? ', …' : ''}` : 'Working tree clean')

const recent = git('log', '-5', '--format=%h %ad %s', '--date=short')
if (recent) lines.push('', 'Recent commits:', ...recent.split('\n').map((l) => `  ${l}`))

// Commits since the state file last changed: a hint that it may be stale.
const stateCommit = git('log', '-1', '--format=%h', '--', 'docs/PROJECT_STATE.md')
if (stateCommit) {
  const since = git('rev-list', '--count', `${stateCommit}..HEAD`)
  if (since && since !== '0') lines.push('', `docs/PROJECT_STATE.md last changed in ${stateCommit}; ${since} commit(s) since. Verify it before relying on it.`)
}

// The board lives in the main working tree, even when this session runs in a worktree.
const commonDir = git('rev-parse', '--path-format=absolute', '--git-common-dir')
const boardPath = join(commonDir ? dirname(resolve(commonDir)) : process.cwd(), '.kanban', 'board.json')
if (existsSync(boardPath)) {
  try {
    const board = JSON.parse(readFileSync(boardPath, 'utf8'))
    const done = new Set(board.tickets.filter((t) => t.column?.id === 'done').map((t) => t.id))
    const show = (t) => {
      const blocked = (t.depends_on ?? []).some((d) => !done.has(d)) ? ' [blocked]' : ''
      const owner = t.column?.owner ? ` @${t.column.owner}` : ''
      return `  ${t.id} (${t.status})${owner}${blocked}: ${t.title}`
    }
    lines.push('', `Board (${boardPath}):`)
    for (const column of ['doing', 'review', 'todo']) {
      const tickets = board.tickets.filter((t) => t.column?.id === column)
      const shown = column === 'todo' ? tickets.slice(0, 3) : tickets
      lines.push(`${column}: ${tickets.length ? '' : 'none'}`, ...shown.map(show))
      if (shown.length < tickets.length) lines.push(`  … ${tickets.length - shown.length} more`)
    }
  } catch {
    lines.push('', `Board at ${boardPath} could not be read.`)
  }
} else {
  lines.push('', 'No .kanban/board.json found.')
}

lines.push('', 'Follow the session-start protocol in CLAUDE.md.')
console.log(lines.join('\n'))
