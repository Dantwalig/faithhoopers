'use client'

import { useEffect, useState, useRef } from 'react'
import { Role } from '@/lib/enums'

interface Message {
  id: string
  senderId: string
  body: string
  subject: string | null
  isBroadcast: boolean
  readAt: string | null
  createdAt: string
  sender: { name: string; role: Role }
  receiver?: { id: string; name: string; role: Role } | null
}

interface User {
  id: string
  name: string
  role: Role
  email: string
}

interface Props {
  currentUserId: string
  currentUserRole: Role
  canBroadcast?: boolean
}

const ROLE_COLORS: Record<Role, string> = {
  ADMIN:  'bg-purple-100 text-purple-800',
  COACH:  'bg-spirit-100 text-spirit-700',
  PLAYER: 'bg-court-100 text-court-800',
  PARENT: 'bg-blue-100 text-blue-800',
}

export default function MessagesView({ currentUserId, currentUserRole, canBroadcast = false }: Props) {
  const [tab, setTab]                   = useState<'broadcast' | 'direct'>('broadcast')
  const [broadcasts, setBroadcasts]     = useState<Message[]>([])
  const [threads, setThreads]           = useState<Message[]>([])
  const [conversation, setConversation] = useState<Message[]>([])
  const [activeThread, setActiveThread] = useState<User | null>(null)
  const [users, setUsers]               = useState<User[]>([])
  const [loading, setLoading]           = useState(true)

  // Compose state
  const [showCompose, setShowCompose]   = useState(false)
  const [composeType, setComposeType]   = useState<'broadcast' | 'direct'>('broadcast')
  const [recipient, setRecipient]       = useState<User | null>(null)
  const [recipientSearch, setRecipientSearch] = useState('')
  const [subject, setSubject]           = useState('')
  const [body, setBody]                 = useState('')
  const [sending, setSending]           = useState(false)
  const [sendError, setSendError]       = useState('')

  const bottomRef = useRef<HTMLDivElement>(null)

  // Load broadcasts and direct threads
  useEffect(() => {
    Promise.all([
      fetch('/api/messages/broadcast').then(r => r.json()),
      fetch('/api/messages/direct').then(r => r.json()),
      fetch('/api/users').then(r => r.json()),
    ]).then(([bc, dt, us]) => {
      setBroadcasts(bc)
      setThreads(dt)
      setUsers(us.filter((u: User) => u.id !== currentUserId))
      setLoading(false)
    })
  }, [currentUserId])

  // Load conversation when active thread changes
  useEffect(() => {
    if (!activeThread) return
    fetch(`/api/messages/direct?withUserId=${activeThread.id}`)
      .then(r => r.json())
      .then(setConversation)
  }, [activeThread])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation])

  async function handleSend() {
    if (!body.trim()) return
    setSending(true); setSendError('')

    const endpoint = composeType === 'broadcast' ? '/api/messages/broadcast' : '/api/messages/direct'
    const payload: any = { body, subject }
    if (composeType === 'direct' && recipient) payload.receiverId = recipient.id

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()

    if (!res.ok) { setSendError(data.error || 'Failed to send'); setSending(false); return }

    if (composeType === 'broadcast') {
      setBroadcasts(b => [data, ...b])
    } else {
      if (activeThread?.id === recipient?.id) {
        setConversation(c => [...c, data])
      }
    }

    setBody(''); setSubject(''); setRecipient(null); setShowCompose(false)
    setSending(false)
  }

  async function openThread(user: User) {
    setActiveThread(user)
    setTab('direct')
  }

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(recipientSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(recipientSearch.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Messages</h1>
          <p className="text-ink-500 text-sm mt-0.5">Broadcasts and direct conversations</p>
        </div>
        <button onClick={() => { setShowCompose(true); setComposeType(canBroadcast ? 'broadcast' : 'direct') }}
          className="btn-primary">+ Compose</button>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-ink-100 rounded-2xl p-1 w-fit">
        {(['broadcast', 'direct'] as const).map(t => (
          <button key={t} onClick={() => { setTab(t); setActiveThread(null) }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === t ? 'bg-white text-ink-800 shadow-sm' : 'text-ink-500 hover:text-ink-700'
            }`}>
            {t === 'broadcast' ? '📢 Broadcasts' : '💬 Direct'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card card-body h-64 animate-pulse"/>
      ) : tab === 'broadcast' ? (
        /* ── Broadcast feed ── */
        <div className="space-y-3">
          {broadcasts.length === 0 ? (
            <div className="card card-body text-center py-12">
              <p className="text-3xl mb-3">📢</p>
              <p className="text-ink-500">No broadcast messages yet.</p>
            </div>
          ) : broadcasts.map(m => (
            <div key={m.id} className="card hover:shadow-md transition-shadow">
              <div className="card-body">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${ROLE_COLORS[m.sender.role]}`}>
                    {m.sender.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-ink-800 text-sm">{m.sender.name}</span>
                        <span className={`badge text-xs ${ROLE_COLORS[m.sender.role]}`}>
                          {m.sender.role.toLowerCase()}
                        </span>
                      </div>
                      <span className="text-xs text-ink-400 shrink-0">
                        {new Date(m.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    {m.subject && <p className="font-medium text-ink-700 text-sm mb-1">{m.subject}</p>}
                    <p className="text-sm text-ink-600 leading-relaxed">{m.body}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ── Direct messages ── */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Thread list */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide px-1 mb-2">Conversations</p>
            {threads.length === 0 && !activeThread ? (
              <p className="text-sm text-ink-400 px-2">No conversations yet.</p>
            ) : null}
            {threads.map(t => {
              const partner: { id?: string; name: string; role: Role } | null =
                t.sender.role !== currentUserRole
                  ? t.sender
                  : (t.receiver as { id?: string; name: string; role: Role } | null)
              const isActive = activeThread?.name === partner?.name
              return (
                <button key={t.id}
                  onClick={() => partner && openThread({ id: t.senderId === currentUserId ? (t.receiver as User)?.id : t.senderId, ...partner } as User)}
                  className={`w-full text-left p-3 rounded-xl transition-colors ${isActive ? 'bg-court-50 border border-court-200' : 'hover:bg-ink-100'}`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${ROLE_COLORS[partner?.role ?? Role.PLAYER]}`}>
                      {(partner?.name ?? '?').charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink-700 truncate">{partner?.name}</p>
                      <p className="text-xs text-ink-400 truncate">{t.body}</p>
                    </div>
                    {!t.readAt && t.senderId !== currentUserId && (
                      <span className="w-2 h-2 rounded-full bg-court-500 shrink-0"/>
                    )}
                  </div>
                </button>
              )
            })}

            {/* New conversation */}
            <button
              onClick={() => { setShowCompose(true); setComposeType('direct') }}
              className="w-full text-left p-3 rounded-xl text-sm text-court-500 hover:bg-court-50 font-medium"
            >
              + New conversation
            </button>
          </div>

          {/* Conversation pane */}
          <div className="lg:col-span-2">
            {!activeThread ? (
              <div className="card card-body text-center py-16 h-full flex flex-col items-center justify-center">
                <p className="text-3xl mb-3">💬</p>
                <p className="text-ink-500 text-sm">Select a conversation or start a new one</p>
              </div>
            ) : (
              <div className="card flex flex-col" style={{ height: '520px' }}>
                {/* Header */}
                <div className="px-5 py-4 border-b border-ink-100 flex items-center gap-3 shrink-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${ROLE_COLORS[activeThread.role]}`}>
                    {activeThread.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-ink-800 text-sm">{activeThread.name}</p>
                    <p className="text-xs text-ink-400 capitalize">{activeThread.role.toLowerCase()}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {conversation.length === 0 && (
                    <p className="text-center text-sm text-ink-400 mt-8">No messages yet. Say hello!</p>
                  )}
                  {conversation.map(m => {
                    const mine = m.senderId === currentUserId
                    return (
                      <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                          mine
                            ? 'bg-court-500 text-white rounded-br-sm'
                            : 'bg-ink-100 text-ink-800 rounded-bl-sm'
                        }`}>
                          <p className="leading-relaxed">{m.body}</p>
                          <p className={`text-xs mt-1 ${mine ? 'text-court-200' : 'text-ink-400'}`}>
                            {new Date(m.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={bottomRef}/>
                </div>

                {/* Input */}
                <div className="px-4 py-3 border-t border-ink-100 flex gap-2 shrink-0">
                  <input
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    className="input flex-1 py-2"
                    placeholder="Type a message… (Enter to send)"
                  />
                  <button onClick={handleSend} disabled={sending || !body.trim()} className="btn-primary px-4">
                    {sending ? '…' : 'Send'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Compose modal */}
      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg">
            <div className="px-6 py-5 border-b border-ink-100 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink-800">
                {composeType === 'broadcast' ? '📢 Broadcast Message' : '💬 Direct Message'}
              </h2>
              <button onClick={() => setShowCompose(false)} className="text-ink-400 hover:text-ink-700 text-xl">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {/* Type toggle */}
              <div className="flex gap-2">
                {canBroadcast && (
                  <button onClick={() => setComposeType('broadcast')}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
                      composeType === 'broadcast' ? 'bg-court-50 border-court-300 text-court-700' : 'border-ink-200 text-ink-500'
                    }`}>
                    📢 Broadcast to all
                  </button>
                )}
                <button onClick={() => setComposeType('direct')}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
                    composeType === 'direct' ? 'bg-court-50 border-court-300 text-court-700' : 'border-ink-200 text-ink-500'
                  }`}>
                  💬 Direct message
                </button>
              </div>

              {/* Recipient (direct only) */}
              {composeType === 'direct' && (
                <div>
                  <label className="label">To</label>
                  {recipient ? (
                    <div className="flex items-center gap-2 p-3 rounded-xl border border-court-200 bg-court-50">
                      <span className="text-sm font-medium text-ink-800">{recipient.name}</span>
                      <span className={`badge text-xs ${ROLE_COLORS[recipient.role]}`}>{recipient.role.toLowerCase()}</span>
                      <button onClick={() => setRecipient(null)} className="ml-auto text-ink-400 hover:text-ink-700 text-xs">✕</button>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        value={recipientSearch}
                        onChange={e => setRecipientSearch(e.target.value)}
                        className="input" placeholder="Search by name or email…"
                      />
                      {recipientSearch && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-ink-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                          {filteredUsers.slice(0, 8).map(u => (
                            <button key={u.id}
                              onClick={() => { setRecipient(u); setRecipientSearch('') }}
                              className="w-full text-left px-4 py-2.5 hover:bg-ink-50 flex items-center gap-2">
                              <span className="text-sm text-ink-800">{u.name}</span>
                              <span className={`badge text-xs ${ROLE_COLORS[u.role]}`}>{u.role.toLowerCase()}</span>
                            </button>
                          ))}
                          {filteredUsers.length === 0 && (
                            <p className="px-4 py-3 text-sm text-ink-400">No users found</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="label">Subject <span className="text-ink-400 font-normal">(optional)</span></label>
                <input value={subject} onChange={e => setSubject(e.target.value)} className="input" placeholder="Subject…"/>
              </div>
              <div>
                <label className="label">Message</label>
                <textarea
                  value={body} onChange={e => setBody(e.target.value)}
                  className="input h-32 resize-none" placeholder="Write your message…"
                />
              </div>

              {sendError && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{sendError}</div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setShowCompose(false)} className="btn-secondary flex-1">Cancel</button>
                <button
                  onClick={handleSend}
                  disabled={sending || !body.trim() || (composeType === 'direct' && !recipient)}
                  className="btn-primary flex-1"
                >
                  {sending ? 'Sending…' : 'Send Message'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
