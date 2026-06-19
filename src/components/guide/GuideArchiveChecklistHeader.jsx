import { useState } from 'react'

function EditIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
    </svg>
  )
}

export default function GuideArchiveChecklistHeader({ title, dateLine, companions = [], travelStyles = [], onSaveTitle }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(title)
  const [saving, setSaving] = useState(false)

  const startEdit = () => {
    setDraft(title)
    setEditing(true)
  }
  const cancel = () => setEditing(false)
  const save = async () => {
    const next = draft.trim()
    if (!next || next === title) {
      setEditing(false)
      return
    }
    setSaving(true)
    try {
      await onSaveTitle?.(next)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <header className="mb-6">
      {editing ? (
        <div className="flex items-center gap-2">
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') save()
              else if (e.key === 'Escape') cancel()
            }}
            maxLength={120}
            className="w-full max-w-xl rounded-xl border-2 border-teal-300 px-3 py-1.5 text-2xl font-extrabold leading-snug tracking-tight text-gray-900 outline-none focus:border-teal-500 md:text-3xl"
          />
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="shrink-0 rounded-lg bg-teal-600 px-3 py-2 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-60"
          >
            저장
          </button>
          <button
            type="button"
            onClick={cancel}
            className="shrink-0 rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold text-gray-500 hover:bg-gray-50"
          >
            취소
          </button>
        </div>
      ) : (
        <div className="flex items-start gap-1.5">
          <h1 className="text-2xl font-extrabold leading-snug tracking-tight text-gray-900 md:text-3xl">{title}</h1>
          {onSaveTitle && (
            <button
              type="button"
              onClick={startEdit}
              aria-label="제목 수정"
              className="mt-1 shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-teal-700"
            >
              <EditIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      )}
      {dateLine && (
        <p className="mt-2 flex items-center gap-2 text-base font-semibold text-gray-700 md:text-lg">
          <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-teal-600 md:h-2.5 md:w-2.5" aria-hidden />
          {dateLine}
        </p>
      )}
      {(companions.length > 0 || travelStyles.length > 0) && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {companions.map((label) => (
            <span key={label} className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700 ring-1 ring-inset ring-teal-600/20">
              {label}
            </span>
          ))}
          {travelStyles.map((label) => (
            <span key={label} className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
              {label}
            </span>
          ))}
        </div>
      )}
      <p className="mt-4 text-sm leading-relaxed text-gray-600">
        저장한 체크리스트를 확인하고 빠짐없이 준비해보세요
      </p>
    </header>
  )
}
