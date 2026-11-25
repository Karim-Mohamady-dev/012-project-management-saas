import { useState } from 'react'
import type { FormEvent } from 'react'
import { CaretLeft, CaretRight, Plus, Trash } from '@phosphor-icons/react'
import type { Dict, TArrFn, TFn } from '../App.tsx'

type Task = { id: number; title: string; tag: string }
type Column = { name: string; tasks: Task[] }

function str(v: unknown): string {
  return typeof v === 'string' ? v : ''
}

export default function Demo({ t, ta }: { t: TFn; ta: TArrFn }) {
  const [columns, setColumns] = useState<Column[]>(() =>
    ta('demo.columns').map((c, ci) => ({
      name: str(c.name),
      tasks: (Array.isArray(c.tasks) ? (c.tasks as Dict[]) : []).map((task, ti) => ({
        id: ci * 100 + ti,
        title: str(task.title),
        tag: str(task.tag),
      })),
    })),
  )
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')
  const [nextId, setNextId] = useState(900)

  const move = (col: number, taskId: number, dir: number) => {
    setColumns((prev) => {
      const next = prev.map((c) => ({ ...c, tasks: [...c.tasks] }))
      const from = next[col]
      const idx = from.tasks.findIndex((task) => task.id === taskId)
      if (idx < 0) return prev
      const target = col + dir
      if (target < 0 || target >= next.length) return prev
      const [task] = from.tasks.splice(idx, 1)
      next[target].tasks.push(task)
      return next
    })
  }

  const remove = (col: number, taskId: number) => {
    setColumns((prev) => prev.map((c, i) => (i === col ? { ...c, tasks: c.tasks.filter((task) => task.id !== taskId) } : c)))
  }

  const addTask = (e: FormEvent) => {
    e.preventDefault()
    if (title.trim().length < 3) {
      setError(t('demo.error'))
      return
    }
    setError('')
    setColumns((prev) => prev.map((c, i) => (i === 0 ? { ...c, tasks: [...c.tasks, { id: nextId, title: title.trim(), tag: t('demo.newTag') }] } : c)))
    setNextId(nextId + 1)
    setTitle('')
  }

  const total = columns.reduce((sum, c) => sum + c.tasks.length, 0)

  return (
    <div className="rounded-2xl border border-line bg-surface p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="title-2">{t('demo.boardTitle')}</p>
        <p className="caption-2 text-muted">
          {total} {t('demo.taskCount')}
        </p>
      </div>
      <form onSubmit={addTask} className="mt-4 flex flex-col gap-2 sm:flex-row" noValidate>
        <label htmlFor="kanban-new" className="sr-only">
          {t('demo.addPlaceholder')}
        </label>
        <input
          id="kanban-new"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('demo.addPlaceholder')}
          className="body-3 flex-1 rounded-xl border border-line bg-paper px-3 py-2 placeholder:text-muted"
        />
        <button type="submit" className="button-md inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-3 py-2 text-white transition-opacity duration-300 hover:opacity-90">
          <Plus size={16} />
          {t('demo.addButton')}
        </button>
      </form>
      {error && (
        <p role="alert" className="caption-2 mt-2 text-red-600">
          {error}
        </p>
      )}
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {columns.map((col, ci) => (
          <section key={col.name} aria-label={col.name} className="rounded-2xl border border-line bg-paper p-4">
            <div className="flex items-center justify-between">
              <h3 className="title-3">{col.name}</h3>
              <span className="caption-4 rounded-full bg-accent/10 px-3 py-2 text-accent">{col.tasks.length}</span>
            </div>
            {col.tasks.length === 0 ? (
              <p className="body-6 mt-4 rounded-xl border border-dashed border-line p-4 text-center text-muted">{t('demo.empty')}</p>
            ) : (
              <ul className="mt-4 flex flex-col gap-2">
                {col.tasks.map((task) => (
                  <li key={task.id} className="rounded-xl border border-line bg-surface p-4">
                    <p className="body-5">{task.title}</p>
                    <p className="caption-5 mt-2 text-muted">{task.tag}</p>
                    <div className="mt-4 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => move(ci, task.id, -1)}
                        disabled={ci === 0}
                        aria-label={t('demo.moveBack')}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-line transition-opacity duration-300 hover:border-accent disabled:opacity-30"
                      >
                        <CaretLeft size={16} className="rtl:rotate-180" />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(ci, task.id, 1)}
                        disabled={ci === columns.length - 1}
                        aria-label={t('demo.moveForward')}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-line transition-opacity duration-300 hover:border-accent disabled:opacity-30"
                      >
                        <CaretRight size={16} className="rtl:rotate-180" />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(ci, task.id)}
                        aria-label={t('demo.remove')}
                        className="ms-auto flex h-8 w-8 items-center justify-center rounded-lg border border-line transition-opacity duration-300 hover:border-red-500 hover:text-red-600"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
      <p className="caption-5 mt-4 text-muted">{t('demo.note')}</p>
    </div>
  )
}
