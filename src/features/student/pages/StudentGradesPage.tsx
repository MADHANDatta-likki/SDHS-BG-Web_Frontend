import { Fragment, useCallback, useMemo, useState } from "react";

import { isSupplementalChapter } from "../../../utils/chapterLabel";
import GradeBadge from "../components/GradeBadge";
import StudentCard from "../components/StudentCard";
import StudentPageHeader from "../components/StudentPageHeader";
import StudentState from "../components/StudentState";
import CurrentEnrollmentSummary from "../../enrollment/components/CurrentEnrollmentSummary";
import { useEnrollment } from "../../../hooks/useEnrollment";
import { useStudentResource } from "../hooks/useStudentResource";
import studentService from "../services/StudentService";
import "../styles/student.css";

function StudentGradesPage() {
  const { selectedEnrollment } = useEnrollment();
  const enrollmentId = (selectedEnrollment?.enrollmentId ?? selectedEnrollment?.id)!;
  const load = useCallback(
    () => studentService.getGrades(enrollmentId),
    [enrollmentId],
  );
  const { data, error, loading, reload } = useStudentResource(
    load,
    "Failed to load grade history.",
  );
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [expandedGrade, setExpandedGrade] = useState<number | null>(null);

  const dates = useMemo(
    () =>
      [
        ...new Set(
          (data?.grades ?? [])
            .map((grade) => grade.date)
            .filter((date): date is string => Boolean(date)),
        ),
      ].sort((left, right) => right.localeCompare(left)),
    [data?.grades],
  );

  const chapters = useMemo(
    () =>
      [
        ...new Map(
          (data?.grades ?? [])
            .filter((grade) => grade.chapterNumber !== undefined)
            .map((grade) => [
              String(grade.chapterNumber),
              isSupplementalChapter(grade.chapterName)
                ? grade.chapterName ?? ""
                : `Chapter ${grade.chapterNumber}${
                    grade.chapterName ? ` — ${grade.chapterName}` : ""
                  }`,
            ]),
        ).entries(),
      ].sort(([left], [right]) => Number(left) - Number(right)),
    [data?.grades],
  );

  const grades = useMemo(
    () =>
      [...(data?.grades ?? [])]
        .filter(
          (grade) =>
            (selectedDate === "" || grade.date === selectedDate) &&
            (selectedChapter === "" ||
              String(grade.chapterNumber) === selectedChapter),
        )
        .sort(
          (left, right) =>
            (right.date ?? "").localeCompare(left.date ?? "") ||
            (right.id - left.id),
        ),
    [data?.grades, selectedChapter, selectedDate],
  );

  return (
    <div className="student-page student-page--results student-journey-page student-history-page">
      <StudentPageHeader
        title="Exam History"
        action={
          <button
            className="student-button student-button--secondary"
            type="button"
            onClick={() => void reload()}
          >
            Refresh
          </button>
        }
      />
      <CurrentEnrollmentSummary />
      {loading && <StudentState type="loading" message="Loading grades..." />}
      {!loading && error && (
        <StudentState
          type="error"
          message={error}
          onRetry={() => void reload()}
        />
      )}
      {!loading && data && (
        <StudentCard
          title="Exam Results"
          label={`${grades.length} of ${data.grades.length}`}
        >
          {data.grades.length === 0 ? (
            <StudentState
              type="empty"
              message="No exam results yet. After you attend a booked examination and your teacher submits grades, the results will appear here."
            />
          ) : (
            <>
              <div className="student-results-toolbar" role="search">
                <label>
                  Exam date
                  <select
                    value={selectedDate}
                    onChange={(event) => {
                      setSelectedDate(event.target.value);
                      setExpandedGrade(null);
                    }}
                  >
                    <option value="">All dates</option>
                    {dates.map((date) => (
                      <option key={date} value={date}>
                        {date}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Chapter
                  <select
                    value={selectedChapter}
                    onChange={(event) => {
                      setSelectedChapter(event.target.value);
                      setExpandedGrade(null);
                    }}
                  >
                    <option value="">All chapters</option>
                    {chapters.map(([chapter, label]) => (
                      <option key={chapter} value={chapter}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                {(selectedDate !== "" || selectedChapter !== "") && (
                  <button
                    className="student-button student-button--secondary"
                    type="button"
                    onClick={() => {
                      setSelectedDate("");
                      setSelectedChapter("");
                    }}
                  >
                    Clear filters
                  </button>
                )}
              </div>
              {grades.length === 0 ? (
                <StudentState
                  type="empty"
                  message="No results match the selected filters."
                />
              ) : (
                <div className="student-results-table-wrap">
                  <table className="student-results-table">
                    <caption className="sr-only">Examination results matching the selected filters</caption>
                    <thead>
                      <tr>
                        <th scope="col">Exam Date</th>
                        <th scope="col">Chapter</th>
                        <th scope="col">Sloka Range</th>
                        <th scope="col">Memorization</th>
                        <th scope="col">Pronunciation</th>
                        <th scope="col">Teacher</th>
                        <th scope="col">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grades.map((grade) => {
                        const expanded = expandedGrade === grade.id;
                        const detailsId = `student-result-details-${grade.id}`;
                        return (
                          <Fragment key={grade.id}>
                            <tr
                              className={
                                grade.cancelled
                                  ? "student-result-row--cancelled"
                                  : undefined
                              }
                            >
                              <td data-label="Exam Date">
                                <time dateTime={grade.date ?? undefined}>
                                  {grade.formattedDate ?? grade.date ?? "-"}
                                </time>
                                {grade.cancelled && (
                                  <span className="student-cancelled">
                                    Cancelled
                                  </span>
                                )}
                              </td>
                              <td data-label="Chapter">
                                {isSupplementalChapter(grade.chapterName) ? (
                                  <strong>{grade.chapterName}</strong>
                                ) : (
                                  <>
                                    <strong>
                                      Ch {grade.chapterNumber ?? "-"}
                                    </strong>
                                    <span>{grade.chapterName ?? ""}</span>
                                  </>
                                )}
                              </td>
                              <td data-label="Sloka Range">
                                {grade.slokaCount ?? "-"}
                              </td>
                              <td data-label="Memorization">
                                <GradeBadge
                                  grade={grade.memorizationGrade}
                                />
                              </td>
                              <td data-label="Pronunciation">
                                <GradeBadge
                                  grade={grade.pronunciationGrade}
                                />
                              </td>
                              <td data-label="Teacher">
                                {grade.assignedTeacherName ?? "-"}
                              </td>
                              <td data-label="Remarks">
                                <button
                                  className={`student-remarks-toggle${
                                    grade.teacherComment
                                      ? " student-remarks-toggle--available"
                                      : ""
                                  }`}
                                  type="button"
                                  aria-expanded={expanded}
                                  aria-controls={detailsId}
                                  onClick={() =>
                                    setExpandedGrade((current) =>
                                      current === grade.id ? null : grade.id,
                                    )
                                  }
                                >
                                  <span aria-hidden="true">
                                    {grade.teacherComment ? "●" : "○"}
                                  </span>
                                  {expanded ? "Hide" : "Details"}
                                </button>
                              </td>
                            </tr>
                            {expanded && (
                              <tr
                                className="student-result-details"
                                id={detailsId}
                              >
                                <td colSpan={7}>
                                  <dl>
                                    <div>
                                      <dt>Teacher remarks</dt>
                                      <dd>
                                        {grade.teacherComment ??
                                          "No remarks provided."}
                                      </dd>
                                    </div>
                                    <div>
                                      <dt>Exam slot</dt>
                                      <dd>{grade.slotName ?? "-"}</dd>
                                    </div>
                                  </dl>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </StudentCard>
      )}
    </div>
  );
}

export default StudentGradesPage;
