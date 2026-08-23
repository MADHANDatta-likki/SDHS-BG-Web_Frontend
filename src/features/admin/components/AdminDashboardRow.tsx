import { useState } from "react";
import { isSupplementalChapter } from "../../../utils/chapterLabel";
import type { SaveDashboardRowRequest, TeacherOption, TeachersDashboardBooking } from "../types/api";

function AdminDashboardRow({ booking, teachers, grades, working, onSave, onDelete }: {
  booking: TeachersDashboardBooking;
  teachers: TeacherOption[];
  grades: string[];
  working: boolean;
  onSave: (request: SaveDashboardRowRequest) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  const [memorizationGrade, setMemorizationGrade] = useState(booking.memorizationGrade ?? "");
  const [pronunciationGrade, setPronunciationGrade] = useState(booking.pronunciationGrade ?? "");
  const [comment, setComment] = useState(booking.teacherComment ?? "");
  const [assignedTeacherId, setAssignedTeacherId] = useState(booking.assignedTeacherId ?? "");
  return <article className="admin-booking"><header><div><h3>{booking.studentName}</h3><span>{booking.volunteerId}</span>{booking.studentPhone && <span><a href={`tel:${booking.studentPhone}`} style={{ color: "inherit" }}>{booking.studentPhone}</a></span>}</div><div><strong>{booking.slotName ?? "No slot"}</strong><span>{isSupplementalChapter(booking.chapterName) ? booking.chapterName : `Ch ${booking.chapterNumber}`} · {booking.slokaCount ?? "-"} slokas</span></div></header><div className="admin-form-grid"><label className="admin-field">Teacher<select value={assignedTeacherId} onChange={(e) => setAssignedTeacherId(e.target.value)}><option value="">Unassigned</option>{teachers.map((teacher) => <option key={teacher.volunteerId} value={teacher.volunteerId}>{teacher.name}</option>)}</select></label><label className="admin-field">Memorization<select value={memorizationGrade} onChange={(e) => setMemorizationGrade(e.target.value)}><option value="">Not graded</option>{grades.map((grade) => <option key={`m-${grade}`}>{grade}</option>)}</select></label><label className="admin-field">Pronunciation<select value={pronunciationGrade} onChange={(e) => setPronunciationGrade(e.target.value)}><option value="">Not graded</option>{grades.map((grade) => <option key={`p-${grade}`}>{grade}</option>)}</select></label><label className="admin-field">Comment<input value={comment} onChange={(e) => setComment(e.target.value)} /></label></div><div className="admin-row-actions"><button className="admin-button admin-button--primary" type="button" disabled={working} onClick={() => void onSave({ bookingId: booking.id, assignedTeacherId, memorizationGrade, pronunciationGrade, comment })}>Save</button><button className="admin-button admin-button--danger" type="button" disabled={working} onClick={() => void onDelete(booking.id)}>Delete</button></div></article>;
}
export default AdminDashboardRow;
