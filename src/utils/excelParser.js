import * as XLSX from 'xlsx'

export function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array', cellDates: true })
        const results = []

        workbook.SheetNames.forEach((sheetName) => {
          const sheet = workbook.Sheets[sheetName]
          const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })
          rows.forEach((row, idx) => {
            const examDate    = row['시험날짜'] || row['exam_date'] || ''
            const subjectName = row['과목']    || row['subject_name'] || ''
            const examTitle   = row['시험명']  || row['exam_title'] || ''
            const studentNum  = String(row['수험번호'] || row['student_number'] || '')
            const studentName = row['응시자명'] || row['student_name'] || ''
            const room        = String(row['배정고사장'] || row['assigned_room'] || '')

            if (!studentNum || !studentName) return

            results.push({
              _sheet: sheetName,
              _row: idx + 2,
              exam_date: examDate instanceof Date
                ? examDate.toISOString().slice(0, 10)
                : String(examDate).trim(),
              subject_name: String(subjectName).trim(),
              exam_title:   String(examTitle).trim(),
              student_number: studentNum.trim(),
              student_name:   String(studentName).trim(),
              assigned_room:  room.trim(),
            })
          })
        })

        resolve(results)
      } catch (err) {
        reject(new Error('엑셀 파일 파싱 오류: ' + err.message))
      }
    }
    reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다.'))
    reader.readAsArrayBuffer(file)
  })
}

export function validateRows(rows, knownRooms) {
  const errors = []
  const roomSet = new Set(knownRooms)
  const seen = new Set()

  rows.forEach((row) => {
    const key = `${row.exam_date}|${row.subject_name}|${row.student_number}`
    if (seen.has(key)) {
      errors.push({ row: row._row, sheet: row._sheet, type: 'DUPLICATE',
        message: `수험번호 ${row.student_number} 중복` })
    }
    seen.add(key)

    if (row.assigned_room && !roomSet.has(row.assigned_room)) {
      errors.push({ row: row._row, sheet: row._sheet, type: 'UNKNOWN_ROOM',
        message: `'${row.assigned_room}'은 등록되지 않은 고사장`, room: row.assigned_room })
    }

    if (!row.exam_date || !row.subject_name || !row.exam_title) {
      errors.push({ row: row._row, sheet: row._sheet, type: 'MISSING_FIELD',
        message: '필수 항목(시험날짜/과목/시험명) 누락' })
    }
  })

  return errors
}
