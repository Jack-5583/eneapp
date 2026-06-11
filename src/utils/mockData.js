export const mockExams = [
  { exam_id: 1, exam_date: '2026-06-15', subject_name: '국어', exam_title: '1학기 기말고사 국어', examinee_count: 120, status: 'DONE' },
  { exam_id: 2, exam_date: '2026-06-15', subject_name: '수학', exam_title: '1학기 기말고사 수학', examinee_count: 118, status: 'DONE' },
  { exam_id: 3, exam_date: '2026-06-16', subject_name: '영어', exam_title: '1학기 기말고사 영어', examinee_count: 115, status: 'ACTIVE' },
  { exam_id: 4, exam_date: '2026-06-17', subject_name: '과학', exam_title: '1학기 기말고사 과학', examinee_count: 0,   status: 'READY' },
  { exam_id: 5, exam_date: '2026-06-17', subject_name: '사회', exam_title: '1학기 기말고사 사회', examinee_count: 0,   status: 'READY' },
]

export const mockExaminees = {
  1: [
    { examinee_id: 1, exam_id: 1, student_number: '30101', student_name: '김성현', assigned_room: '301호', status: 'PRESENT' },
    { examinee_id: 2, exam_id: 1, student_number: '30102', student_name: '홍길동', assigned_room: '301호', status: 'ABSENT' },
    { examinee_id: 3, exam_id: 1, student_number: '30103', student_name: '이지수', assigned_room: '302호', status: 'PRESENT' },
    { examinee_id: 4, exam_id: 1, student_number: '30104', student_name: '박민준', assigned_room: '302호', status: 'PRESENT' },
    { examinee_id: 5, exam_id: 1, student_number: '30105', student_name: '최유진', assigned_room: '303호', status: 'PRESENT' },
  ],
  2: [
    { examinee_id: 6, exam_id: 2, student_number: '30101', student_name: '김성현', assigned_room: '302호', status: 'PRESENT' },
    { examinee_id: 7, exam_id: 2, student_number: '30102', student_name: '홍길동', assigned_room: '302호', status: 'PRESENT' },
    { examinee_id: 8, exam_id: 2, student_number: '30103', student_name: '이지수', assigned_room: '303호', status: 'PRESENT' },
  ],
  3: [
    { examinee_id: 9,  exam_id: 3, student_number: '30101', student_name: '김성현', assigned_room: '301호', status: 'READY' },
    { examinee_id: 10, exam_id: 3, student_number: '30102', student_name: '홍길동', assigned_room: '301호', status: 'READY' },
  ],
}

export const mockRooms = [
  { room_id: 1, room_number: '301호', current_exam_id: 3 },
  { room_id: 2, room_number: '302호', current_exam_id: 3 },
  { room_id: 3, room_number: '303호', current_exam_id: 3 },
  { room_id: 4, room_number: '304호', current_exam_id: null },
]
