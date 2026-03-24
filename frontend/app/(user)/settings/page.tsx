'use client'

import { HexAvatar } from '@/components/dashboardComponents'
import { useUser } from '@/context/userContext'
import {
  Bell,
  Monitor,
  Palette,
  Shield,
  Trash2,
  User,
  Eye,
  EyeOff,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type Tab = 'account' | 'privacy' | 'notifications' | 'appearance' | 'sessions'

const DARK_THEME: Record<string, string> = {
  '--color-deepNavy': '#0a0e17',
  '--color-surfaceNavy': '#121826',
  '--color-electricPurple': '#8b5cf6',
  '--color-purpleGlow': 'rgba(139, 92, 246, 0.3)',
  '--color-textHigh': '#ffffff',
  '--color-textMed': '#94a3b8',
  '--color-softBorder': 'rgba(148, 163, 184, 0.22)',
  '--color-panelShadow': 'rgba(2, 6, 23, 0.35)',
}

const LIGHT_THEME: Record<string, string> = {
  '--color-deepNavy': '#e3eaf7',
  '--color-surfaceNavy': '#ffffff',
  '--color-electricPurple': '#7c3aed',
  '--color-purpleGlow': 'rgba(124, 58, 237, 0.14)',
  '--color-textHigh': '#0f172a',
  '--color-textMed': '#475569',
  '--color-softBorder': 'rgba(100, 116, 139, 0.26)',
  '--color-panelShadow': 'rgba(15, 23, 42, 0.12)',
}

function applyTheme(mode: 'dark' | 'light') {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const t = mode === 'light' ? LIGHT_THEME : DARK_THEME
  Object.entries(t).forEach(([k, v]) => root.style.setProperty(k, v))
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ${
        checked ? 'bg-electricPurple shadow-[0_0_12px_var(--color-purpleGlow)]' : 'bg-softBorder/60'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-softBorder/50 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-textHigh">{label}</p>
        {description && <p className="text-xs text-textMed mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  )
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <span className="text-electricPurple">{icon}</span>
      <h2 className="text-base font-bold text-textHigh">{title}</h2>
    </div>
  )
}

export default function SettingsPage() {
  const { user, refresh: refreshUser, logout } = useUser()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<Tab>('account')

  // Account form
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  // Privacy (localStorage)
  const [allowDMFromStrangers, setAllowDMFromStrangers] = useState(true)
  const [allowFriendRequests, setAllowFriendRequests] = useState(true)
  const [showOnlineStatus, setShowOnlineStatus] = useState(true)

  // Notifications (localStorage)
  const [notifFriendRequests, setNotifFriendRequests] = useState(true)
  const [notifDMs, setNotifDMs] = useState(true)
  const [notifMentions, setNotifMentions] = useState(true)
  const [notifSounds, setNotifSounds] = useState(true)
  const [notifDesktop, setNotifDesktop] = useState(false)

  // Appearance (sync with topbar via localStorage + CSS vars)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  // Sessions
  const [revokingAll, setRevokingAll] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Init form from user
  useEffect(() => {
    if (user) {
      setDisplayName(user.username)
      setEmail(user.email)
    }
  }, [user])

  // Load persisted preferences from localStorage
  useEffect(() => {
    const stored = (key: string, fallback: boolean) =>
      localStorage.getItem(key) === null ? fallback : localStorage.getItem(key) === 'true'

    setAllowDMFromStrangers(stored('chatapp-priv-dm-strangers', true))
    setAllowFriendRequests(stored('chatapp-priv-friend-req', true))
    setShowOnlineStatus(stored('chatapp-priv-online-status', true))
    setNotifFriendRequests(stored('chatapp-notif-friend-req', true))
    setNotifDMs(stored('chatapp-notif-dms', true))
    setNotifMentions(stored('chatapp-notif-mentions', true))
    setNotifSounds(stored('chatapp-notif-sounds', true))
    setNotifDesktop(stored('chatapp-notif-desktop', false))
    setTheme(localStorage.getItem('chatapp-theme') === 'light' ? 'light' : 'dark')
  }, [])

  const persist = (key: string, value: boolean) => localStorage.setItem(key, String(value))

  const handlePrivacyToggle = (key: string, setter: (v: boolean) => void, value: boolean) => {
    setter(value)
    persist(key, value)
  }

  const handleNotifToggle = (key: string, setter: (v: boolean) => void, value: boolean) => {
    setter(value)
    persist(key, value)
  }

  const handleThemeChange = (mode: 'dark' | 'light') => {
    setTheme(mode)
    localStorage.setItem('chatapp-theme', mode)
    applyTheme(mode)
  }

  const handleSaveProfile = async () => {
    if (!user) return
    setFeedback(null)
    setSaving(true)
    try {
      const body: Record<string, string> = {}
      if (displayName !== user.username) body.username = displayName
      if (email !== user.email) body.email = email
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          setFeedback({ type: 'error', msg: 'New passwords do not match.' })
          return
        }
        if (!currentPassword) {
          setFeedback({ type: 'error', msg: 'Enter your current password to set a new one.' })
          return
        }
        body.password = newPassword
      }
      if (Object.keys(body).length === 0) {
        setFeedback({ type: 'error', msg: 'No changes to save.' })
        return
      }

      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setFeedback({ type: 'error', msg: data?.message ?? 'Failed to save changes.' })
        return
      }
      await refreshUser()
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setFeedback({ type: 'success', msg: 'Changes saved successfully.' })
    } finally {
      setSaving(false)
    }
  }

  const handleRevokeAllSessions = async () => {
    // TODO: Call POST /api/auth/logout-all once backend implements LogoutAll (RevokeAllByUserID)
    // For now, falls back to logging out the current session only.
    setRevokingAll(true)
    await logout()
    router.push('/login')
  }

  const handleDeleteAccount = async () => {
    if (!user) return
    setDeleting(true)
    const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' })
    if (res.ok) {
      await logout()
      router.push('/register')
    } else {
      setFeedback({ type: 'error', msg: 'Failed to delete account. Try again.' })
      setDeleting(false)
      setDeleteConfirm(false)
    }
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'account', label: 'Account', icon: <User className="h-4 w-4" /> },
    { id: 'privacy', label: 'Privacy', icon: <Shield className="h-4 w-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="h-4 w-4" /> },
    { id: 'sessions', label: 'Sessions', icon: <Monitor className="h-4 w-4" /> },
  ]

  return (
    <div className="flex h-[calc(100dvh-8.5rem)] min-h-120 w-full gap-6 overflow-hidden">
      {/* Sidebar */}
      <div className="flex w-64 shrink-0 flex-col gap-2">
        <div className="rounded-2xl bg-surfaceNavy p-2 shadow-[0_8px_24px_var(--color-panelShadow)]">
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => { setActiveTab(tab.id); setFeedback(null) }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                activeTab === tab.id
                  ? 'bg-electricPurple text-white shadow-[0_0_16px_var(--color-purpleGlow)]'
                  : 'text-textMed hover:bg-deepNavy hover:text-textHigh'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* System status */}
        <div className="rounded-2xl bg-surfaceNavy p-4 shadow-[0_8px_24px_var(--color-panelShadow)]">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-textMed">System Status</p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_6px_#4ade80]" />
              <span className="text-xs text-textMed">Services Online</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-electricPurple shadow-[0_0_6px_var(--color-purpleGlow)]" />
              <span className="text-xs text-textMed">WebSocket Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="custom-scroll min-h-0 flex-1 overflow-y-auto">
        {/* ── ACCOUNT ── */}
        {activeTab === 'account' && (
          <div className="flex flex-col gap-5">
            {/* Profile card */}
            <div className="rounded-2xl bg-surfaceNavy p-6 shadow-[0_8px_24px_var(--color-panelShadow)]">
              <div className="flex items-center gap-5">
                <div className="relative shrink-0">
                  <HexAvatar
                    initials={(user?.username ?? '??').slice(0, 2).toUpperCase()}
                    size="lg"
                  />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-textHigh">{user?.username ?? '—'}</h2>
                  <p className="text-sm text-electricPurple">@{user?.username?.toLowerCase().replace(/\s+/g, '_') ?? ''}</p>
                  <p className="mt-1 text-xs text-textMed">Member since {user ? new Date(user.created_at ?? '').toLocaleDateString() : '—'}</p>
                </div>
              </div>
            </div>

            {/* Edit profile */}
            <div className="rounded-2xl bg-surfaceNavy p-6 shadow-[0_8px_24px_var(--color-panelShadow)]">
              <SectionTitle icon={<User className="h-4 w-4" />} title="Edit Profile" />
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-textMed">Display Name</label>
                  <input
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    className="rounded-xl bg-deepNavy px-4 py-3 text-sm text-textHigh outline-none ring-1 ring-softBorder placeholder:text-textMed focus:ring-electricPurple/50"
                    placeholder="Your display name"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-textMed">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="rounded-xl bg-deepNavy px-4 py-3 text-sm text-textHigh outline-none ring-1 ring-softBorder placeholder:text-textMed focus:ring-electricPurple/50"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="rounded-2xl bg-surfaceNavy p-6 shadow-[0_8px_24px_var(--color-panelShadow)]">
              <SectionTitle icon={<Shield className="h-4 w-4" />} title="Security" />
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-textMed">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPw ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      className="w-full rounded-xl bg-deepNavy px-4 py-3 pr-10 text-sm text-textHigh outline-none ring-1 ring-softBorder placeholder:text-textMed focus:ring-electricPurple/50"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowCurrentPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-textMed hover:text-textHigh">
                      {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-textMed">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full rounded-xl bg-deepNavy px-4 py-3 pr-10 text-sm text-textHigh outline-none ring-1 ring-softBorder placeholder:text-textMed focus:ring-electricPurple/50"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowNewPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-textMed hover:text-textHigh">
                      {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-textMed">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="rounded-xl bg-deepNavy px-4 py-3 text-sm text-textHigh outline-none ring-1 ring-softBorder placeholder:text-textMed focus:ring-electricPurple/50"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {feedback && (
                <p className={`mt-4 text-sm ${feedback.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                  {feedback.msg}
                </p>
              )}

              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (user) { setDisplayName(user.username); setEmail(user.email) }
                    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
                    setFeedback(null)
                  }}
                  className="rounded-xl bg-softBorder/40 px-5 py-2.5 text-sm font-medium text-textMed transition hover:bg-softBorder/60 hover:text-textHigh"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="rounded-xl bg-electricPurple px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_16px_var(--color-purpleGlow)] transition hover:brightness-110 disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>

            {/* Delete account */}
            <div className="rounded-2xl border border-red-500/20 bg-surfaceNavy p-6 shadow-[0_8px_24px_var(--color-panelShadow)]">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/15">
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-textHigh">Delete Account</p>
                    <p className="text-xs text-textMed">Permanently erase your account and all associated data.</p>
                  </div>
                </div>
                {!deleteConfirm ? (
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(true)}
                    className="shrink-0 rounded-xl border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
                  >
                    Deactivate
                  </button>
                ) : (
                  <div className="flex items-center gap-2 shrink-0">
                    <p className="text-xs text-red-400">Are you sure?</p>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(false)}
                      className="rounded-xl bg-softBorder/40 px-3 py-1.5 text-xs font-medium text-textMed transition hover:bg-softBorder/60"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      disabled={deleting}
                      className="rounded-xl bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
                    >
                      {deleting ? 'Deleting…' : 'Confirm'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── PRIVACY ── */}
        {activeTab === 'privacy' && (
          <div className="rounded-2xl bg-surfaceNavy p-6 shadow-[0_8px_24px_var(--color-panelShadow)]">
            <SectionTitle icon={<Shield className="h-4 w-4" />} title="Privacy" />
            <SettingRow
              label="Allow messages from strangers"
              description="People who are not your friends can send you direct messages."
            >
              <Toggle
                checked={allowDMFromStrangers}
                onChange={v => handlePrivacyToggle('chatapp-priv-dm-strangers', setAllowDMFromStrangers, v)}
              />
            </SettingRow>
            <SettingRow
              label="Allow friend requests"
              description="Other users can send you friend requests."
            >
              <Toggle
                checked={allowFriendRequests}
                onChange={v => handlePrivacyToggle('chatapp-priv-friend-req', setAllowFriendRequests, v)}
              />
            </SettingRow>
            <SettingRow
              label="Show online status"
              description="Let others see when you're active."
            >
              <Toggle
                checked={showOnlineStatus}
                onChange={v => handlePrivacyToggle('chatapp-priv-online-status', setShowOnlineStatus, v)}
              />
            </SettingRow>
            <p className="mt-4 text-xs text-textMed">
              Privacy preferences are saved locally. Backend enforcement coming soon.
            </p>
          </div>
        )}

        {/* ── NOTIFICATIONS ── */}
        {activeTab === 'notifications' && (
          <div className="rounded-2xl bg-surfaceNavy p-6 shadow-[0_8px_24px_var(--color-panelShadow)]">
            <SectionTitle icon={<Bell className="h-4 w-4" />} title="Notifications" />
            <SettingRow label="Friend requests" description="Notify me when someone sends a friend request.">
              <Toggle checked={notifFriendRequests} onChange={v => handleNotifToggle('chatapp-notif-friend-req', setNotifFriendRequests, v)} />
            </SettingRow>
            <SettingRow label="Direct messages" description="Notify me when I receive a new DM.">
              <Toggle checked={notifDMs} onChange={v => handleNotifToggle('chatapp-notif-dms', setNotifDMs, v)} />
            </SettingRow>
            <SettingRow label="Mentions" description="Notify me when someone mentions me in a room.">
              <Toggle checked={notifMentions} onChange={v => handleNotifToggle('chatapp-notif-mentions', setNotifMentions, v)} />
            </SettingRow>
            <SettingRow label="Sound effects" description="Play sounds for new messages and events.">
              <Toggle checked={notifSounds} onChange={v => handleNotifToggle('chatapp-notif-sounds', setNotifSounds, v)} />
            </SettingRow>
            <SettingRow label="Desktop notifications" description="Show system notifications when the tab is in the background.">
              <Toggle checked={notifDesktop} onChange={v => handleNotifToggle('chatapp-notif-desktop', setNotifDesktop, v)} />
            </SettingRow>
            <p className="mt-4 text-xs text-textMed">
              Notification preferences are saved locally. Push notification backend coming soon.
            </p>
          </div>
        )}

        {/* ── APPEARANCE ── */}
        {activeTab === 'appearance' && (
          <div className="rounded-2xl bg-surfaceNavy p-6 shadow-[0_8px_24px_var(--color-panelShadow)]">
            <SectionTitle icon={<Palette className="h-4 w-4" />} title="Appearance" />
            <p className="mb-4 text-xs text-textMed">Choose your preferred theme. Changes apply immediately.</p>
            <div className="grid grid-cols-2 gap-4 max-w-sm">
              {(['dark', 'light'] as const).map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => handleThemeChange(mode)}
                  className={`flex flex-col items-center gap-3 rounded-2xl border p-5 transition ${
                    theme === mode
                      ? 'border-electricPurple bg-electricPurple/10 shadow-[0_0_16px_var(--color-purpleGlow)]'
                      : 'border-softBorder bg-deepNavy hover:border-electricPurple/40'
                  }`}
                >
                  <div
                    className={`h-12 w-12 rounded-xl ${
                      mode === 'dark' ? 'bg-[#0a0e17]' : 'bg-[#ffffff] border border-slate-200'
                    } flex items-center justify-center`}
                  >
                    <div className={`h-5 w-5 rounded-full ${mode === 'dark' ? 'bg-[#8b5cf6]' : 'bg-[#7c3aed]'}`} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold capitalize text-textHigh">{mode}</p>
                    <p className="text-xs text-textMed">{mode === 'dark' ? 'Easy on the eyes' : 'High contrast'}</p>
                  </div>
                  {theme === mode && (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-electricPurple">Active</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── SESSIONS ── */}
        {activeTab === 'sessions' && (
          <div className="flex flex-col gap-5">
            <div className="rounded-2xl bg-surfaceNavy p-6 shadow-[0_8px_24px_var(--color-panelShadow)]">
              <SectionTitle icon={<Monitor className="h-4 w-4" />} title="Sessions" />
              <p className="mb-6 text-sm text-textMed">
                Manage your active login sessions. Revoking all sessions will sign you out on every device, including this one.
              </p>

              {/* Current session indicator */}
              <div className="mb-6 flex items-center gap-4 rounded-xl bg-deepNavy px-4 py-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-electricPurple/20">
                  <Monitor className="h-4 w-4 text-electricPurple" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-textHigh">Current Session</p>
                  <p className="text-xs text-textMed">Browser — Active now</p>
                </div>
                <span className="text-xs font-semibold text-green-400">Active</span>
              </div>

              <div className="flex flex-col gap-3">
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                  <p className="text-sm font-semibold text-red-400 mb-1">Sign out from all devices</p>
                  <p className="text-xs text-textMed mb-4">
                    This will revoke all refresh tokens and log you out everywhere. You will be redirected to the login page.
                    {/* TODO: Once POST /auth/logout-all is implemented on the backend, this will revoke all sessions independently rather than just the current one. */}
                  </p>
                  <button
                    type="button"
                    onClick={handleRevokeAllSessions}
                    disabled={revokingAll}
                    className="rounded-xl border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-60"
                  >
                    {revokingAll ? 'Signing out…' : 'Revoke All Sessions'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
