import React, { useState } from 'react'
import { Monitor, Wifi, WifiOff, Maximize2, Users, AlertCircle } from 'lucide-react'
import { mockRooms, mockExams, mockExaminees } from '../utils/mockData'

const FEEDS = mockRooms.map((room, i) => ({
  ...room,
  connected: i < 3,
  alert: i === 1,
}))

function CameraFeed({ feed, onExpand }) {
  const exam = mockExams.find(e => e.exam_id === feed.current_exam_id)
  const examinees = Object.values(mockExaminees).flat().filter(e => e.assigned_room === feed.room_number)

  return (
    <div style={{ ...s.feed, ...(feed.alert ? s.feedAlert : {}), ...(feed.connected ? {} : s.feedOffline) }}>
      <div style={s.feedHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ ...s.dot, background: feed.connected
            ? (feed.alert ? 'var(--color-danger)' : 'var(--color-success)')
            : 'var(--color-text-muted)',
            boxShadow: feed.connected ? `0 0 6px ${feed.alert ? 'var(--color-danger)' : 'var(--color-success)'}` : 'none' }} />
          <span style={s.feedRoom}>{feed.room_number}</span>
          {feed.alert && <span style={s.alertBadge}><AlertCircle size={10} /> 이상 감지</span>}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {feed.connected ? <Wifi size={12} style={{ color: 'var(--color-success)' }} />
            : <WifiOff size={12} style={{ color: 'var(--color-text-muted)' }} />}
          <button style={s.expandBtn} onClick={() => onExpand(feed)}><Maximize2 size={11} /></button>
        </div>
      </div>

      <div style={s.videoArea}>
        {feed.connected ? (
          <div style={s.videoPlaceholder}>
            <div style={s.videoInner}>
              <Monitor size={28} style={{ color: 'rgba(14,165,233,0.3)' }} />
              <div style={{ fontSize: 10, color: 'rgba(14,165,233,0.4)', marginTop: 6, letterSpacing: '0.05em' }}>
                LIVE · WebRTC
              </div>
              {feed.alert && (
                <div style={{ position: 'absolute', top: 8, right: 8,
                  background: 'rgba(239,68,68,.8)', color: '#fff', fontSize: 9,
                  padding: '2px 6px', borderRadius: 4, letterSpacing: '0.05em', fontWeight: 700 }}>
                  ⚠ ALERT
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ ...s.videoPlaceholder, background: 'rgba(0,0,0,.3)' }}>
            <div style={{ textAlign: 'center' }}>
              <WifiOff size={20} style={{ color: 'var(--color-text-muted)' }} />
              <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 4 }}>연결 없음</div>
            </div>
          </div>
        )}
      </div>

      <div style={s.feedFooter}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--color-text-muted)' }}>
          <Users size={10} />
          <span>{examinees.length}명 배정</span>
        </div>
        <div style={{ fontSize: 10, color: 'var(--color-text-muted)', maxWidth: 120,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {exam ? exam.exam_title : '시험 없음'}
        </div>
      </div>
    </div>
  )
}

export default function MonitoringPage() {
  const [feeds] = useState(FEEDS)
  const [expanded, setExpanded] = useState(null)
  const [gridCols, setGridCols] = useState(2)

  const connected = feeds.filter(f => f.connected).length
  const alerts = feeds.filter(f => f.alert).length

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>관제 모니터</h1>
          <p style={s.subtitle}>CCTV Monitoring · WebRTC 멀티캠 비디오 관제창</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={s.statPill}>
            <span style={{ color: 'var(--color-success)' }}>{connected}</span> / {feeds.length} 연결
          </div>
          {alerts > 0 && (
            <div style={{ ...s.statPill, borderColor: 'rgba(239,68,68,.3)', background: 'rgba(239,68,68,.08)' }}>
              <AlertCircle size={12} style={{ color: 'var(--color-danger)' }} />
              <span style={{ color: 'var(--color-danger)' }}>{alerts}개 알림</span>
            </div>
          )}
          <div style={{ display: 'flex', gap: 4 }}>
            {[1, 2, 3].map(n => (
              <button key={n} style={{ ...s.gridBtn, ...(gridCols === n ? s.gridBtnActive : {}) }}
                onClick={() => setGridCols(n)}>
                {n}열
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ ...s.grid, gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}>
        {feeds.map(feed => (
          <CameraFeed key={feed.room_id} feed={feed} onExpand={setExpanded} />
        ))}
      </div>

      {expanded && (
        <div style={s.modalOverlay} onClick={() => setExpanded(null)}>
          <div style={s.expandedModal} onClick={e => e.stopPropagation()}>
            <div style={s.expandedHeader}>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: 16, letterSpacing: '0.08em' }}>
                {expanded.room_number} — 확대 보기
              </span>
              <button style={s.closeBtn} onClick={() => setExpanded(null)}>✕</button>
            </div>
            <div style={s.expandedVideo}>
              <div style={{ textAlign: 'center' }}>
                <Monitor size={48} style={{ color: 'rgba(14,165,233,0.4)' }} />
                <div style={{ fontSize: 13, color: 'rgba(14,165,233,0.5)', marginTop: 8, letterSpacing: '0.08em', fontFamily: 'var(--font-heading)' }}>
                  LIVE FEED · {expanded.room_number}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
                  WebRTC 피어 연결 · HD 스트리밍
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const s = {
  page: { padding: '28px 32px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title: { fontFamily: 'var(--font-heading)', fontSize: 22, letterSpacing: '0.08em' },
  subtitle: { fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 },
  grid: { display: 'grid', gap: 14 },
  feed: { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' },
  feedAlert: { borderColor: 'rgba(239,68,68,.4)', boxShadow: '0 0 0 1px rgba(239,68,68,.15)' },
  feedOffline: { opacity: 0.5 },
  feedHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px',
    borderBottom: '1px solid var(--color-border)', background: 'rgba(0,0,0,.2)' },
  feedRoom: { fontFamily: 'var(--font-heading)', fontSize: 13, letterSpacing: '0.08em', color: 'var(--color-text)' },
  dot: { width: 8, height: 8, borderRadius: '50%' },
  alertBadge: { display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px',
    background: 'rgba(239,68,68,.15)', color: 'var(--color-danger)', borderRadius: 20,
    fontSize: 10, fontWeight: 700 },
  expandBtn: { background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer',
    padding: 3, display: 'flex', alignItems: 'center', transition: 'color .15s' },
  videoArea: { aspectRatio: '16/9' },
  videoPlaceholder: { width: '100%', height: '100%', background: 'rgba(14,165,233,0.03)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  videoInner: { textAlign: 'center', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  feedFooter: { display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderTop: '1px solid var(--color-border)' },
  statPill: { display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px',
    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
    borderRadius: 20, fontSize: 12, color: 'var(--color-text-dim)' },
  gridBtn: { padding: '5px 10px', background: 'transparent', border: '1px solid var(--color-border)',
    color: 'var(--color-text-muted)', borderRadius: 6, fontSize: 11, cursor: 'pointer' },
  gridBtnActive: { borderColor: 'var(--color-accent)', color: 'var(--color-accent)', background: 'var(--color-accent-dim)' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  expandedModal: { background: 'var(--color-surface)', border: '1px solid var(--color-border)',
    borderRadius: 14, width: '80vw', maxWidth: 900, overflow: 'hidden' },
  expandedHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 20px', borderBottom: '1px solid var(--color-border)' },
  expandedVideo: { aspectRatio: '16/9', background: 'rgba(14,165,233,0.03)',
    display: 'flex', alignItems: 'center', justifyContent: 'center' },
  closeBtn: { background: 'none', border: 'none', color: 'var(--color-text-muted)',
    cursor: 'pointer', fontSize: 16, padding: 4 },
}
