import { useCallback } from "react";

import GradeBadge from "../components/GradeBadge";
import StudentCard from "../components/StudentCard";
import StudentPageHeader from "../components/StudentPageHeader";
import StudentState from "../components/StudentState";
import { useStudentResource } from "../hooks/useStudentResource";
import studentService from "../services/StudentService";
import "../styles/student.css";

function StudentGradesPage() {
  const load = useCallback(() => studentService.getGrades(), []);
  const { data, error, loading, reload } = useStudentResource(load, "Failed to load grade history.");

  return (
    <div className="student-page">
      <StudentPageHeader
        title="Grade History"
        action={<button className="student-button student-button--secondary" type="button" onClick={() => void reload()}>Refresh</button>}
      />
      {loading && <StudentState type="loading" message="Loading grades..." />}
      {!loading && error && <StudentState type="error" message={error} onRetry={() => void reload()} />}
      {!loading && data && (
        <StudentCard title="Exam Results" label={`${data.grades.length} exam${data.grades.length === 1 ? "" : "s"}`}>
          {data.grades.length === 0 ? (
            <StudentState type="empty" message="No Exam Results Yet. Your grade history will appear here after you complete exams." />
          ) : (
            <div className="student-grade-list">
              {data.grades.map((grade) => (
                <article key={grade.id} className={`student-grade-card${grade.cancelled ? " student-grade-card--cancelled" : ""}`}>
                  {grade.cancelled && <span className="student-cancelled">Cancelled</span>}
                  <header><strong>{grade.formattedDate ?? grade.date ?? ""}</strong><span>{grade.slotName}</span></header>
                  <p><b>Chapter {grade.chapterNumber}</b> {grade.chapterName}</p>
                  <dl>
                    <div><dt>Slokas</dt><dd>{grade.slokaCount ?? "-"}</dd></div>
                    <div><dt>Memorization</dt><dd><GradeBadge grade={grade.memorizationGrade} /></dd></div>
                    <div><dt>Pronunciation</dt><dd><GradeBadge grade={grade.pronunciationGrade} /></dd></div>
                  </dl>
                  {grade.assignedTeacherName && <p className="student-grade-card__meta"><b>Teacher:</b> {grade.assignedTeacherName}</p>}
                  {grade.teacherComment && <blockquote><b>Comment:</b> {grade.teacherComment}</blockquote>}
                </article>
              ))}
            </div>
          )}
        </StudentCard>
      )}
    </div>
  );
}

export default StudentGradesPage;
