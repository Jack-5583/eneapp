import React, { useState, useRef, useCallback } from 'react'
import { ChevronDown, ChevronRight, Upload, Plus, Search, Filter,
         X, AlertTriangle, CheckCircle, Trash2, Edit2, Save, XCircle } from 'lucide-react'
import { mockExams, mockExaminees, mockRooms } from '../utils/mockData'
import { parseExcelFile, validateRows } from '../utils/excelParser'

const STATUS_MAP = {
  READY:  { label: '대기',   cls: 'tag-ready' },
  ACTIVE: { label: '진행중', cls: 'tag-active' },
  DONE:   { label: '완료',   cls: 'tag-done' },
}

const EXAMINEE_STATUS = {
  READY:   { label: '대기',   cls: 'tag-ready' },
  PRESENT: { label: '출석',   cls: 'tag-active' },
  ABSENT:  { label: '결석',   cls: 'tag-absent' },
}

export default function ExamsPage() {
  const [exams, setExams]           = useState(mockExams)
  const [examinees, setExaminees]   = useState(mockExaminees)
  const [expanded, setExpanded]     = useState(null)
  const [search, setSearch]         = useState('')
  const [subjectFilter, setSubjectFilter] = useState('ALL')
  const [dragOver, setDragOver]     = useState(false)
  const [uploading, setUploading]   = useState(false)
  const [editRow, setEditRow]       = useState(null)
  const [editData, setEditData]     = useState({})
  const [validationModal, setValidationModal] = useState(null)
  const [successMsg, setSuccessMsg] = useState('')
  const fileRef = useRef()

  const subjects = ['ALL', ...new Set(exams.map(e => e.subject_name))]

  const filtered = exams.filter(e => {
    const matchSearch = e.exam_title.includes(search) || e.subject_name.includes(search) || e.exam_date.includes(search)
    const matchSubject = subjectFilter === 'ALL' || e.subject_name === subjectFilter
    return matchSearch && matchSubject
  })

  const handleFileProcess = useCallback(async (file) => {
    if (!file) return
    setUploading(true)
    try {
      const rows = await parseExcelFile(file)
      const knownRooms = mockRooms.map(r => r.room_number)
      const errors = validateRows(rows, knownRooms)

      if (errors.length > 0) {
        setValidationModal({ rows, errors, file: file.name })
      } else {
        applyImport(rows)
      }
    } catch (err) {
      alert(err.message)
    } finally {
      setUploading(false)
    }
  }, [])

  const applyImport = (rows) => {
    const newExamMap = {}
    rows.forEach(r => {
      const key = `${r.exam_date}|${r.subject_name}|${r.exam_title}`
      if (!newExamMap[key]) newExamMap[key] = { ...r, students: [] }
      newExamMap[key].students.push(r)
    })

    let nextExamId = Math.max(...exams.map(e => e.exam_id)) + 1
    const addedExams = []
    const addedExaminees = {}

    Object.values(newExamMap).forEach(({ exam_date, subject_name, exam_title, students }) => {
      const existing = exams.find(e => e.exam_date === exam_date && e.subject_name === subject_name && e.exam_title === exam_title)
      const eid = existing ? existing.exam_id : nextExamId++
      if (!existing) {
        addedExams.push({ exam_id: eid, exam_date, subject_name, exam_title, examinee_count: students.length, status: 'READY' })
      }
      let nextEeId = 1000 + eid * 100
      addedExaminees[eid] = students.map(s => ({
        examinee_id: nextEeId++,
        exam_id: eid,
        student_number: s.student_number,
        student_name: s.student_name,
        assigned_room: s.assigned_room,
        status: 'READY',
      }))
    })

    setExams(prev => [...prev.filter(e => !addedExams.find(a => a.exam_id === e.exam_id)), ...addedExams])
    setExaminees(prev => ({ ...prev, ...addedExaminees }))
    setValidationModal(null)
    showSuccess(`${rows.length}명 데이터가 성공적으로 업로드됐습니다.`)
  }

  const showSuccess = (msg) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3500)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileProcess(file)
  }

  const startEdit = (ee) => { setEditRow(ee.examinee_id); setEditData({ ...ee }) }
  const cancelEdit = () => { setEditRow(null); setEditData({}) }
  const saveEdit = (examId) => {
    setExaminees(prev => ({
      ...prev,
      [examId]: prev[examId].map(e => e.examinee_id === editRow ? { ...e, ...editData } : e)
    }))
    cancelEdit()
  }
  const deleteExaminee = (examId, eeId) => {
    setExaminees(prev => ({ ...prev, [examId]: prev[examId].filter(e => e.examinee_id !== eeId) }))
  }

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>시험 관리</h1>
          <p style={s.subtitle}>Exam Management · 시험 일정 및 응시자 데이터를 관리합니다</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {successMsg && (
            <div style={s.successBadge}><CheckCircle size={14} /> {successMsg}</div>
          )}
          <button style={s.btnPrimary} onClick={() => fileRef.current?.click()}>
            <Upload size={14} /> 엑셀 업로드
          </button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }}
            onChange={e => handleFileProcess(e.target.files[0])} />
        </div>
      </div>

      {/* Stats */}
      <div style={s.stats}>
        {[
          { label: '전체 시험', value: exams.length },
          { label: '진행중', value: exams.filter(e => e.status === 'ACTIVE').length, color: 'var(--color-success)' },
          { label: '대기중', value: exams.filter(e => e.status === 'READY').length, color: 'var(--color-text-dim)' },
          { label: '총 응시자', value: exams.reduce((a, e) => a + e.examinee_count, 0), color: 'var(--color-accent)' },
        ].map(({ label, value, color }) => (
          <div key={label} style={s.statCard}>
            <div style={{ ...s.statValue, ...(color ? { color } : {}) }}>{value}</div>
            <div style={s.statLabel}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div style={s.filterBar}>
        <div style={s.searchWrap}>
          <Search size={14} style={{ color: 'var(--color-text-muted)' }} />
          <input style={s.searchInput} placeholder="시험명, 과목, 날짜 검색..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {subjects.map(s2 => (
            <button key={s2} style={{ ...s.filterBtn, ...(subjectFilter === s2 ? s.filterBtnActive : {}) }}
              onClick={() => setSubjectFilter(s2)}>
              {s2 === 'ALL' ? '전체' : s2}
            </button>
          ))}
        </div>
      </div>

      {/* Exam Table */}
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr style={s.thead}>
              {['시험 날짜', '과목', '시험명', '응시자 수', '상태', ''].map(h => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(exam => {
              const isExp = expanded === exam.exam_id
              const list  = examinees[exam.exam_id] || []
              const st    = STATUS_MAP[exam.status] || STATUS_MAP.READY
              return (
                <React.Fragment key={exam.exam_id}>
                  <tr style={{ ...s.tr, ...(isExp ? s.trActive : {}) }}
                    onClick={() => setExpanded(isExp ? null : exam.exam_id)}>
                    <td style={s.td}>{exam.exam_date}</td>
                    <td style={s.td}>
                      <span style={s.subjectBadge}>{exam.subject_name}</span>
                    </td>
                    <td style={{ ...s.td, fontWeight: 500 }}>{exam.exam_title}</td>
                    <td style={s.td}>
                      <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>{exam.examinee_count}</span>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: 11 }}> 명</span>
                    </td>
                    <td style={s.td}>
                      <span className={st.cls} style={s.statusTag}>{st.label}</span>
                    </td>
                    <td style={{ ...s.td, width: 40, textAlign: 'center' }}>
                      {isExp ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </td>
                  </tr>

                  {isExp && (
                    <tr>
                      <td colSpan={6} style={{ padding: 0, borderBottom: '1px solid var(--color-border)' }}>
                        <div style={s.expandPanel}>
                          <div style={s.expandHeader}>
                            <span style={s.expandTitle}>응시자 명단 ({list.length}명)</span>
                            <button style={s.btnSmall} onClick={e => e.stopPropagation()}>
                              <Plus size={12} /> 응시자 추가
                            </button>
                          </div>
                          <table style={{ ...s.table, marginTop: 0 }}>
                            <thead>
                              <tr style={s.thead}>
                                {['수험번호', '이름', '배정 고사장', '상태', ''].map(h => (
                                  <th key={h} style={s.th}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {list.map(ee => {
                                const isEdit = editRow === ee.examinee_id
                                const eeSt = EXAMINEE_STATUS[ee.status] || EXAMINEE_STATUS.READY
                                return (
                                  <tr key={ee.examinee_id} style={s.tr}>
                                    <td style={s.td}>
                                      {isEdit
                                        ? <input style={s.editInput} value={editData.student_number}
                                            onChange={e => setEditData(p => ({ ...p, student_number: e.target.value }))} />
                                        : ee.student_number}
                                    </td>
                                    <td style={s.td}>
                                      {isEdit
                                        ? <input style={s.editInput} value={editData.student_name}
                                            onChange={e => setEditData(p => ({ ...p, student_name: e.target.value }))} />
                                        : ee.student_name}
                                    </td>
                                    <td style={s.td}>
                                      {isEdit
                                        ? <input style={s.editInput} value={editData.assigned_room}
                                            onChange={e => setEditData(p => ({ ...p, assigned_room: e.target.value }))} />
                                        : <span style={s.roomBadge}>{ee.assigned_room}</span>}
                                    </td>
                                    <td style={s.td}>
                                      <span className={eeSt.cls} style={s.statusTag}>{eeSt.label}</span>
                                    </td>
                                    <td style={{ ...s.td, width: 80 }}>
                                      <div style={{ display: 'flex', gap: 6 }}>
                                        {isEdit ? (
                                          <>
                                            <button style={s.iconBtn} onClick={() => saveEdit(exam.exam_id)}><Save size={13} /></button>
                                            <button style={s.iconBtn} onClick={cancelEdit}><XCircle size={13} /></button>
                                          </>
                                        ) : (
                                          <>
                                            <button style={s.iconBtn} onClick={() => startEdit(ee)}><Edit2 size={13} /></button>
                                            <button style={{ ...s.iconBtn, color: 'var(--color-danger)' }}
                                              onClick={() => deleteExaminee(exam.exam_id, ee.examinee_id)}><Trash2 size={13} /></button>
                                          </>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                )
                              })}
                              {list.length === 0 && (
                                <tr><td colSpan={5} style={{ ...s.td, textAlign: 'center', color: 'var(--color-text-muted)', padding: 24 }}>
                                  응시자 데이터가 없습니다. 엑셀을 업로드하거나 개별 추가하세요.
                                </td></tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Drop Zone */}
      <div style={{ ...s.dropZone, ...(dragOver ? s.dropZoneActive : {}) }}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}>
        <Upload size={24} style={{ color: dragOver ? 'var(--color-accent)' : 'var(--color-text-muted)' }} />
        <div style={{ fontSize: 13, color: dragOver ? 'var(--color-accent)' : 'var(--color-text-muted)', marginTop: 6 }}>
          엑셀 파일을 드래그하거나 클릭해서 업로드
        </div>
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
          .xlsx · 시험날짜 / 과목 / 시험명 / 수험번호 / 응시자명 / 배정고사장
        </div>
        {uploading && <div style={{ marginTop: 8, color: 'var(--color-accent)', fontSize: 12 }}>파싱 중...</div>}
      </div>

      {/* Validation Modal */}
      {validationModal && (
        <div style={s.modalOverlay} onClick={() => setValidationModal(null)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={18} style={{ color: 'var(--color-warning)' }} />
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: 15, letterSpacing: '0.05em' }}>
                  데이터 유효성 검사
                </span>
              </div>
              <button style={s.iconBtn} onClick={() => setValidationModal(null)}><X size={16} /></button>
            </div>
            <div style={{ padding: '16px 20px', fontSize: 13, color: 'var(--color-text-dim)' }}>
              <strong style={{ color: 'var(--color-text)' }}>{validationModal.file}</strong> 파일에서
              {' '}<strong style={{ color: 'var(--color-warning)' }}>{validationModal.errors.length}개</strong>의 문제가 발견됐습니다.
            </div>
            <div style={s.errorList}>
              {validationModal.errors.map((err, i) => (
                <div key={i} style={s.errorItem}>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>[{err.sheet}] {err.row}행</div>
                  <div style={{ fontSize: 12, color: 'var(--color-warning)', marginTop: 2 }}>{err.message}</div>
                </div>
              ))}
            </div>
            <div style={s.modalFooter}>
              <button style={s.btnDanger} onClick={() => setValidationModal(null)}>취소</button>
              <button style={s.btnPrimary} onClick={() => applyImport(validationModal.rows)}>
                오류 제외하고 업로드
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const s = {
  page: { padding: '28px 32px', minHeight: '100%' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title: { fontFamily: 'var(--font-heading)', fontSize: 22, letterSpacing: '0.08em', color: 'var(--color-text)' },
  subtitle: { fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4, letterSpacing: '0.02em' },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 },
  statCard: { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '16px 20px' },
  statValue: { fontSize: 28, fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--color-text)' },
  statLabel: { fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4, letterSpacing: '0.04em' },
  filterBar: { display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' },
  searchWrap: { display: 'flex', alignItems: 'center', gap: 8, background: 'var(--color-surface)',
    border: '1px solid var(--color-border)', borderRadius: 8, padding: '8px 12px', flex: 1, minWidth: 200 },
  searchInput: { background: 'none', border: 'none', outline: 'none', color: 'var(--color-text)',
    fontSize: 13, width: '100%' },
  filterBtn: { padding: '6px 14px', borderRadius: 6, border: '1px solid var(--color-border)',
    background: 'transparent', color: 'var(--color-text-muted)', fontSize: 12, cursor: 'pointer', transition: 'all .15s' },
  filterBtnActive: { borderColor: 'var(--color-accent)', color: 'var(--color-accent)',
    background: 'var(--color-accent-dim)' },
  tableWrap: { background: 'var(--color-surface)', border: '1px solid var(--color-border)',
    borderRadius: 12, overflow: 'hidden', marginBottom: 16 },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: 'rgba(0,0,0,0.2)' },
  th: { padding: '10px 16px', textAlign: 'left', fontSize: 11, color: 'var(--color-text-muted)',
    letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 },
  tr: { borderBottom: '1px solid var(--color-border)', cursor: 'pointer',
    transition: 'background .12s' },
  trActive: { background: 'rgba(14,165,233,0.05)' },
  td: { padding: '12px 16px', fontSize: 13, color: 'var(--color-text)', verticalAlign: 'middle' },
  statusTag: { padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, letterSpacing: '0.03em' },
  subjectBadge: { background: 'rgba(99,102,241,.15)', color: 'var(--color-accent-2)',
    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 },
  roomBadge: { background: 'rgba(14,165,233,.1)', color: 'var(--color-accent)',
    padding: '3px 10px', borderRadius: 20, fontSize: 11 },
  expandPanel: { background: 'var(--color-surface-2)', padding: '16px 24px 0' },
  expandHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  expandTitle: { fontSize: 12, color: 'var(--color-text-dim)', letterSpacing: '0.04em', fontWeight: 600 },
  editInput: { background: 'var(--color-surface-3)', border: '1px solid var(--color-border-light)',
    borderRadius: 6, padding: '4px 8px', color: 'var(--color-text)', fontSize: 12, outline: 'none', width: '100%' },
  iconBtn: { background: 'none', border: 'none', color: 'var(--color-text-muted)',
    cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', transition: 'color .15s' },
  dropZone: { border: '2px dashed var(--color-border)', borderRadius: 12, padding: '28px',
    textAlign: 'center', cursor: 'pointer', transition: 'all .2s', display: 'flex',
    flexDirection: 'column', alignItems: 'center' },
  dropZoneActive: { borderColor: 'var(--color-accent)', background: 'var(--color-accent-dim)' },
  btnPrimary: { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
    background: 'var(--color-accent)', color: '#fff', border: 'none', borderRadius: 8,
    fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  btnSmall: { display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px',
    background: 'var(--color-surface-3)', color: 'var(--color-text-dim)', border: '1px solid var(--color-border)',
    borderRadius: 6, fontSize: 11, cursor: 'pointer' },
  btnDanger: { padding: '8px 16px', background: 'transparent', color: 'var(--color-danger)',
    border: '1px solid var(--color-danger)', borderRadius: 8, fontSize: 12, cursor: 'pointer' },
  successBadge: { display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
    background: 'rgba(16,185,129,.12)', color: 'var(--color-success)', borderRadius: 8,
    fontSize: 12, border: '1px solid rgba(16,185,129,.25)' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: 'var(--color-surface)', border: '1px solid var(--color-border)',
    borderRadius: 14, width: 480, maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '18px 20px', borderBottom: '1px solid var(--color-border)' },
  errorList: { overflow: 'auto', padding: '0 20px 16px', maxHeight: 260 },
  errorItem: { padding: '10px 12px', background: 'rgba(239,68,68,.06)',
    border: '1px solid rgba(239,68,68,.15)', borderRadius: 8, marginBottom: 8 },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: 10,
    padding: '16px 20px', borderTop: '1px solid var(--color-border)' },
}
