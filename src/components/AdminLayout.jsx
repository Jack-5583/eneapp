import React from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Radio, Monitor, LogOut } from 'lucide-react'

const NAV = [
  { to: '/admin/exams',      icon: LayoutDashboard, label: '시험 관리',  sub: 'Exam Management' },
  { to: '/admin/control',    icon: Radio,           label: '실시간 제어', sub: 'Live Control' },
  { to: '/admin/monitoring', icon: Monitor,         label: '관제 모니터', sub: 'CCTV Monitoring' },
]

export default function AdminLayout() {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <img src="/owl.png" alt="TUSK-UP" style={{ width: 36, height: 36, objectFit: 'contain' }} />
          <div>
            <div style={styles.logoTitle}>TUSK-UP</div>
            <div style={styles.logoSub}>PORTAL</div>
          </div>
        </div>

        <nav style={styles.nav}>
          {NAV.map(({ to, icon: Icon, label, sub }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navActive : {}),
            })}>
              {({ isActive }) => (
                <>
                  <div style={{ ...styles.navIcon, ...(isActive ? styles.navIconActive : {}) }}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-muted)', letterSpacing: '0.05em', marginTop: 1 }}>{sub}</div>
                  </div>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div style={styles.sidebarBottom}>
          <div style={styles.version}>v1.0.0 · PORTAL</div>
        </div>
      </aside>

      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}

const styles = {
  sidebar: {
    width: 220,
    minWidth: 220,
    background: 'var(--color-surface)',
    borderRight: '1px solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column',
    padding: '0',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '24px 20px 20px',
    borderBottom: '1px solid var(--color-border)',
  },
  logoTitle: {
    fontFamily: 'var(--font-heading)',
    fontWeight: 700,
    fontSize: 16,
    letterSpacing: '0.12em',
    color: 'var(--color-accent)',
    lineHeight: 1.2,
  },
  logoSub: {
    fontFamily: 'var(--font-heading)',
    fontSize: 9,
    letterSpacing: '0.2em',
    color: 'var(--color-text-muted)',
    marginTop: 1,
  },
  nav: {
    flex: 1,
    padding: '12px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 12px',
    borderRadius: 8,
    textDecoration: 'none',
    color: 'var(--color-text-muted)',
    transition: 'all 0.15s',
  },
  navActive: {
    background: 'var(--color-accent-dim)',
    color: 'var(--color-accent)',
  },
  navIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255,255,255,0.04)',
    flexShrink: 0,
  },
  navIconActive: {
    background: 'var(--color-accent-dim)',
    color: 'var(--color-accent)',
  },
  sidebarBottom: {
    padding: '16px 20px',
    borderTop: '1px solid var(--color-border)',
  },
  version: {
    fontSize: 10,
    color: 'var(--color-text-muted)',
    letterSpacing: '0.08em',
  },
  main: {
    flex: 1,
    overflow: 'auto',
    background: 'var(--color-bg)',
  },
}
