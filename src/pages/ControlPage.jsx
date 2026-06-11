import React, { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Volume2, Send, Clock, Radio, Bell, ChevronRight } from 'lucide-react'
import { mockRooms, mockExams } from '../utils/mockData'

const TIMELINE_EVENTS = [
  { time: '09:00', label: '시험 시작 안내 방송', type: 'broadcast', done: true },
  { time: '09:05', label: '시험지 배부 완료', type: 'action', done: true },
  { time: '10:00', label: '중간 시간 안내 (50분 경과)', type: 'broadcast', done: false },
  { time: '10:50', label: '10분 전 종료 예고 방송', type: 'broadcast', done: false },
  { time: '11:00', label: '시험 종료 방송', type: 'broadcast', done: false },
]

const ANNOUNCEMENTS = [
  '지금부터 1학기 기말고사를 시작합니다. 수험생 여러분은 답안지에 수험번호를 기재하시기 바랍니다.',
  '시험 시간이 10분 남았습니다. 답안지 마킹을 확인하시기 바랍니다.',
  '지금부터 시험을 종료합니다. 필기구를 내려놓으시고 답안지를 제출하시기 바랍니다.',
  '화장실 이용이 필요한 수험생은 조용히 손을 들어 감독관에게 알려주시기 바랍니다.',
]

function useTimer(initial = 0) {
  const [time, setTime] = useState(initial)
  const [running, setRunning] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => setTime(t => t + 1), 1000)
    } else {
      clearInterval(ref.current)
    }
    return () => clearInterval(ref.current)
  }, [running])

  const fmt = (s) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return [h, m, sec].map(v => String(v).padStart(2, '0')).join(':')
  }

  return { time: fmt(time), running, toggle: () => setRunning(r => !r), reset: () => { setRunning(false); setTime(initial) } }
}

export default function ControlPage() {
  const timer = useTimer(0)
  const countdownTimer = useTimer(3600)
  const [rooms] = useState(mockRooms)
  const [activeAnnouncement, setActiveAnnouncement] = useState('')
  const [customMsg, setCustomMsg] = useState('')
  const [sentLog, setSentLog] = useState([])
  const [timeline, setTimeline] = useState(TIMELINE_EVENTS)

  const sendAnnouncement = (msg) => {
    if (!msg.trim()) return
    const entry = { time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }), msg }
    setSentLog(prev => [entry, ...prev].slice(0, 20))
    setCustomMsg('')
    setActiveAnnouncement('')
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>실시간 제어</h1>
          <p style={s.subtitle}>Live Control · 고사장별 방송 및 타임라인을 실시간으로 관리합니다</p>
        </div>
      </div>

      <div style={s.grid}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Timer Panel */}
          <div style={s.card}>
            <div style={s.cardLabel}><Clock size={13} /> 경과 시간</div>
            <div style={s.bigTimer}>{timer.time}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button style={{ ...s.timerBtn, ...(timer.running ? s.timerBtnPause : s.timerBtnPlay) }}
                onClick={timer.toggle}>
                {timer.running ? <Pause size={14} /> : <Play size={14} />}
                {timer.running ? '일시정지' : '시작'}
              </button>
              <button style={s.timerBtnReset} onClick={timer.reset}><RotateCcw size={13} /></button>
            </div>
          </div>

          {/* Countdown */}
          <div style={s.card}>
            <div style={s.cardLabel}><Clock size={13} /> 카운트다운 (시험 종료까지)</div>
            <div style={{ ...s.bigTimer, color: countdownTimer.running ? 'var(--color-warning)' : 'var(--color-text)' }}>
              {countdownTimer.time}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button style={{ ...s.timerBtn, ...(countdownTimer.running ? s.timerBtnPause : s.timerBtnPlay) }}
                onClick={countdownTimer.toggle}>
                {countdownTimer.running ? <Pause size={14} /> : <Play size={14} />}
                {countdownTimer.running ? '일시정지' : '시작'}
              </button>
              <button style={s.timerBtnReset} onClick={countdownTimer.reset}><RotateCcw size={13} /></button>
            </div>
          </div>

          {/* Room Status */}
          <div style={s.card}>
            <div style={s.cardLabel}><Radio size={13} /> 고사장 상태</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
              {rooms.map(room => {
                const exam = mockExams.find(e => e.exam_id === room.current_exam_id)
                return (
                  <div key={room.room_id} style={s.roomRow}>
                    <div style={s.roomNum}>{room.room_number}</div>
                    <div style={{ flex: 1, fontSize: 12, color: exam ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                      {exam ? exam.exam_title : '시험 없음'}
                    </div>
                    <div style={{ width: 8, height: 8, borderRadius: '50%',
                      background: exam ? 'var(--color-success)' : 'var(--color-text-muted)',
                      boxShadow: exam ? '0 0 6px var(--color-success)' : 'none' }} />
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Announcement Panel */}
          <div style={s.card}>
            <div style={s.cardLabel}><Volume2 size={13} /> 안내방송 발송</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
              {ANNOUNCEMENTS.map((msg, i) => (
                <button key={i}
                  style={{ ...s.msgPreset, ...(activeAnnouncement === msg ? s.msgPresetActive : {}) }}
                  onClick={() => setActiveAnnouncement(msg)}>
                  <ChevronRight size={11} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 12, lineHeight: 1.5 }}>{msg}</span>
                </button>
              ))}
            </div>
            <div style={{ marginTop: 12 }}>
              <textarea style={s.textarea}
                placeholder="직접 입력하거나 위에서 선택하세요..."
                value={activeAnnouncement || customMsg}
                onChange={e => { setCustomMsg(e.target.value); setActiveAnnouncement('') }}
                rows={3} />
              <button style={{ ...s.btnPrimary, marginTop: 8, width: '100%', justifyContent: 'center' }}
                onClick={() => sendAnnouncement(activeAnnouncement || customMsg)}>
                <Send size={13} /> 전체 고사장 방송 발송
              </button>
            </div>
          </div>

          {/* Timeline */}
          <div style={s.card}>
            <div style={s.cardLabel}><Bell size={13} /> 시험 타임라인</div>
            <div style={{ marginTop: 12 }}>
              {timeline.map((event, i) => (
                <div key={i} style={s.timelineItem} onClick={() => setTimeline(prev =>
                  prev.map((e, idx) => idx === i ? { ...e, done: !e.done } : e))}>
                  <div style={{ ...s.timelineDot, ...(event.done ? s.timelineDotDone : {}) }} />
                  {i < timeline.length - 1 && <div style={{ ...s.timelineLine, ...(event.done ? s.timelineLineDone : {}) }} />}
                  <div style={s.timelineContent}>
                    <div style={{ fontSize: 11, color: event.done ? 'var(--color-accent)' : 'var(--color-text-muted)',
                      fontFamily: 'var(--font-heading)', letterSpacing: '0.05em' }}>{event.time}</div>
                    <div style={{ fontSize: 12, color: event.done ? 'var(--color-text)' : 'var(--color-text-dim)',
                      marginTop: 2, textDecoration: event.done ? 'line-through' : 'none' }}>{event.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>
                      {event.type === 'broadcast' ? '📢 방송' : '✅ 액션'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sent Log */}
        <div style={{ ...s.card, gridColumn: '1 / -1' }}>
          <div style={s.cardLabel}><Send size={13} /> 발송 기록</div>
          {sentLog.length === 0
            ? <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 10, textAlign: 'center', padding: 16 }}>
                발송된 방송이 없습니다.
              </div>
            : <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {sentLog.map((log, i) => (
                  <div key={i} style={s.logItem}>
                    <span style={{ fontSize: 11, color: 'var(--color-accent)', fontFamily: 'var(--font-heading)',
                      letterSpacing: '0.05em', flexShrink: 0 }}>{log.time}</span>
                    <span style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>{log.msg}</span>
                  </div>
                ))}
              </div>}
        </div>
      </div>
    </div>
  )
}

const s = {
  page: { padding: '28px 32px' },
  header: { marginBottom: 24 },
  title: { fontFamily: 'var(--font-heading)', fontSize: 22, letterSpacing: '0.08em' },
  subtitle: { fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  card: { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '18px 20px' },
  cardLabel: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 11,
    color: 'var(--color-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 },
  bigTimer: { fontFamily: 'var(--font-heading)', fontSize: 48, letterSpacing: '0.08em',
    color: 'var(--color-text)', marginTop: 8, lineHeight: 1 },
  timerBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
    borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', flex: 1 },
  timerBtnPlay: { background: 'var(--color-success)', color: '#fff' },
  timerBtnPause: { background: 'var(--color-warning)', color: '#000' },
  timerBtnReset: { padding: '8px 12px', background: 'var(--color-surface-2)',
    border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', borderRadius: 8, cursor: 'pointer',
    display: 'flex', alignItems: 'center' },
  roomRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
    background: 'var(--color-surface-2)', borderRadius: 8 },
  roomNum: { fontFamily: 'var(--font-heading)', fontSize: 13, color: 'var(--color-accent)',
    letterSpacing: '0.05em', width: 40 },
  msgPreset: { display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px',
    background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8,
    color: 'var(--color-text-dim)', cursor: 'pointer', textAlign: 'left', transition: 'all .15s' },
  msgPresetActive: { borderColor: 'var(--color-accent)', background: 'var(--color-accent-dim)', color: 'var(--color-text)' },
  textarea: { width: '100%', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
    borderRadius: 8, padding: '10px 12px', color: 'var(--color-text)', fontSize: 12, resize: 'none',
    outline: 'none', lineHeight: 1.6 },
  btnPrimary: { display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px',
    background: 'var(--color-accent)', color: '#fff', border: 'none', borderRadius: 8,
    fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  timelineItem: { display: 'flex', gap: 12, position: 'relative', paddingBottom: 20, cursor: 'pointer' },
  timelineDot: { width: 10, height: 10, borderRadius: '50%', background: 'var(--color-border-light)',
    flexShrink: 0, marginTop: 3, zIndex: 1, transition: 'background .2s' },
  timelineDotDone: { background: 'var(--color-accent)', boxShadow: '0 0 8px var(--color-accent)' },
  timelineLine: { position: 'absolute', left: 4, top: 13, width: 2, height: '100%',
    background: 'var(--color-border)', zIndex: 0 },
  timelineLineDone: { background: 'var(--color-accent-dim)' },
  timelineContent: { flex: 1 },
  logItem: { display: 'flex', gap: 12, padding: '8px 10px', background: 'var(--color-surface-2)',
    borderRadius: 8, alignItems: 'flex-start' },
}
