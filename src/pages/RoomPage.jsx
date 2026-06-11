import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { mockExams, mockExaminees, mockRooms } from '../utils/mockData'

function useCurrentTime() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return now
}

export default function RoomPage() {
  const { roomId } = useParams()
  const now = useCurrentTime()
  const room = mockRooms.find(r => r.room_number === roomId || String(r.room_id) === roomId)
  const exam = room ? mockExams.find(e => e.exam_id === room.current_exam_id) : null
  const examinees = exam ? (mockExaminees[exam.exam_id] || []).filter(e => e.assigned_room === room?.room_number) : []

  const timeStr = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  const dateStr = now.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })

  return (
    <div style={r.page}>
      {/* Header bar */}
      <div style={r.topBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/owl.png" alt="TUSK-UP" style={{ width: 28, height: 28, objectFit: 'contain' }} />
          <span style={r.logoText}>TUSK-UP</span>
        </div>
        <div style={r.roomBadge}>{room ? room.room_number : `고사장 ${roomId}`}</div>
      </div>

      {/* Clock */}
      <div style={r.clockSection}>
        <div style={r.clock}>{timeStr}</div>
        <div style={r.date}>{dateStr}</div>
      </div>

      {/* Exam Info */}
      {exam ? (
        <div style={r.examCard}>
          <div style={r.examSubject}>{exam.subject_name}</div>
          <div style={r.examTitle}>{exam.exam_title}</div>
          <div style={r.examDate}>{exam.exam_date}</div>
        </div>
      ) : (
        <div style={r.noExam}>현재 배정된 시험이 없습니다</div>
      )}

      {/* Examinee List */}
      {examinees.length > 0 && (
        <div style={r.listWrap}>
          <div style={r.listTitle}>응시자 명단 ({examinees.length}명)</div>
          <div style={r.listGrid}>
            {examinees.map(ee => (
              <div key={ee.examinee_id} style={r.eeCard}>
                <div style={r.eeNum}>{ee.student_number}</div>
                <div style={r.eeName}>{ee.student_name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notice */}
      <div style={r.notice}>
        <div style={r.noticeIcon}>📢</div>
        <div style={r.noticeText}>시험 중 부정행위는 전 과목 0점 처리됩니다.</div>
      </div>
    </div>
  )
}

const r = {
  page: { minHeight: '100vh', background: 'var(--color-bg)', display: 'flex',
    flexDirection: 'column', alignItems: 'center', padding: '0 0 40px' },
  topBar: { width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 32px', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' },
  logoText: { fontFamily: 'var(--font-heading)', fontSize: 16, letterSpacing: '0.15em',
    color: 'var(--color-accent)', fontWeight: 700 },
  roomBadge: { fontFamily: 'var(--font-heading)', fontSize: 14, letterSpacing: '0.1em',
    color: 'var(--color-text)', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
    padding: '4px 14px', borderRadius: 20 },
  clockSection: { marginTop: 48, textAlign: 'center' },
  clock: { fontFamily: 'var(--font-heading)', fontSize: 96, letterSpacing: '0.08em',
    color: 'var(--color-text)', lineHeight: 1, fontWeight: 700 },
  date: { fontSize: 16, color: 'var(--color-text-muted)', marginTop: 8, letterSpacing: '0.04em' },
  examCard: { marginTop: 40, background: 'var(--color-surface)', border: '1px solid var(--color-border)',
    borderRadius: 16, padding: '24px 40px', textAlign: 'center', minWidth: 400 },
  examSubject: { fontSize: 12, color: 'var(--color-accent)', letterSpacing: '0.1em',
    fontFamily: 'var(--font-heading)', marginBottom: 8 },
  examTitle: { fontFamily: 'var(--font-heading)', fontSize: 24, letterSpacing: '0.06em',
    color: 'var(--color-text)', fontWeight: 700 },
  examDate: { fontSize: 13, color: 'var(--color-text-muted)', marginTop: 6 },
  noExam: { marginTop: 40, fontSize: 16, color: 'var(--color-text-muted)' },
  listWrap: { marginTop: 32, width: '100%', maxWidth: 640, padding: '0 20px' },
  listTitle: { fontSize: 12, color: 'var(--color-text-muted)', letterSpacing: '0.06em',
    marginBottom: 12, textAlign: 'center' },
  listGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 },
  eeCard: { background: 'var(--color-surface)', border: '1px solid var(--color-border)',
    borderRadius: 10, padding: '10px', textAlign: 'center' },
  eeNum: { fontSize: 10, color: 'var(--color-text-muted)', letterSpacing: '0.04em' },
  eeName: { fontSize: 13, color: 'var(--color-text)', fontWeight: 600, marginTop: 2 },
  notice: { marginTop: 40, display: 'flex', alignItems: 'center', gap: 10,
    background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)',
    borderRadius: 12, padding: '12px 24px', maxWidth: 480 },
  noticeIcon: { fontSize: 20 },
  noticeText: { fontSize: 13, color: 'var(--color-text-dim)' },
}
