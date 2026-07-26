import { useCallback } from "react";

import StudentCard from "../components/StudentCard";
import StudentPageHeader from "../components/StudentPageHeader";
import StudentState from "../components/StudentState";
import { useStudentResource } from "../hooks/useStudentResource";
import studentService from "../services/StudentService";
import type { StudentAttendanceRecord } from "../types/api";
import "../styles/student.css";

function formatDate(value?: string | null): string {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function attendanceStatus(record: StudentAttendanceRecord): string {
  if (record.noClass) return "No Class";
  return record.present ? "Present" : "Absent";
}

function StudentAttendancePage() {
  const load = useCallback(() => studentService.getAttendance(), []);
  const { data, error, loading, reload } = useStudentResource(load, "Failed to load attendance data.");

  return (
    <div className="student-page">
      <StudentPageHeader title="My Attendance" />
      {loading && <StudentState type="loading" message="Loading attendance..." />}
      {!loading && error && <StudentState type="error" message={error} onRetry={() => void reload()} />}
      {!loading && data && (
        <>
          <section className="student-identity" aria-label="Student attendance summary">
            <h2>{data.studentName}</h2>
            <div className="student-badges">
              <span>{data.volunteerId}</span>
              {data.groupId && <span>Group {data.groupId}</span>}
              {data.groupStatus && <span>{data.groupStatus}</span>}
            </div>
            {(data.groupStartDate || data.groupEndDate) && (
              <p>{formatDate(data.groupStartDate)} - {formatDate(data.groupEndDate)}</p>
            )}
          </section>
          <div className="student-stat-grid">
            <div><strong>{data.present}</strong><span>Present</span></div>
            <div><strong>{data.total}</strong><span>Total Classes</span></div>
            <div><strong>{data.percent}</strong><span>Percentage</span></div>
          </div>
          <StudentCard title="Attendance History" label={`${data.history.length} Records`}>
            {data.history.length === 0 ? (
              <StudentState type="empty" message="No attendance records found." />
            ) : (
              <div className="student-table-wrap">
                <table className="student-table">
                  <thead><tr><th scope="col">Class Date</th><th scope="col">Group</th><th scope="col">Status</th></tr></thead>
                  <tbody>
                    {data.history.map((record) => {
                      const status = attendanceStatus(record);
                      return (
                        <tr key={record.id}>
                          <td>{formatDate(record.classDate)}</td>
                          <td>{record.groupId ? `Group ${record.groupId}` : "-"}</td>
                          <td><span className={`student-attendance student-attendance--${status.toLowerCase().replace(" ", "-")}`}>{status}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </StudentCard>
          <aside className="student-alert student-alert--info">
            Attendance percentage is calculated based on the number of classes you were present out of the total classes held. Classes marked as &quot;No Class&quot; are excluded from the calculation.
          </aside>
        </>
      )}
    </div>
  );
}

export default StudentAttendancePage;
