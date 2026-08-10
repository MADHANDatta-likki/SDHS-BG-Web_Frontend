import { Fragment, useState } from "react";

import { isSupplementalChapter } from "../../../utils/chapterLabel";
import type { TeacherDashboardBooking, UpdateGradeRequest } from "../types/api";

interface GradeEditorProps {
  booking: TeacherDashboardBooking;
  grades: string[];
  saving: boolean;
  feedback?: { type: "success" | "error"; message: string };
  expanded: boolean;
  onToggle: () => void;
  onSave: (request: UpdateGradeRequest) => Promise<void>;
}

function GradeEditor({
  booking,
  grades,
  saving,
  feedback,
  expanded,
  onToggle,
  onSave,
}: GradeEditorProps) {
  const [memorizationGrade, setMemorizationGrade] = useState(
    booking.memorizationGrade ?? "",
  );
  const [pronunciationGrade, setPronunciationGrade] = useState(
    booking.pronunciationGrade ?? "",
  );
  const [comment, setComment] = useState(booking.teacherComment ?? "");
  const changed =
    memorizationGrade !== (booking.memorizationGrade ?? "") ||
    pronunciationGrade !== (booking.pronunciationGrade ?? "") ||
    comment !== (booking.teacherComment ?? "");
  const detailsId = `teacher-booking-details-${booking.id}`;

  return (
    <Fragment>
      <tr
        className={`teacher-grading-row${
          booking.cancelled ? " teacher-grading-row--cancelled" : ""
        }`}
      >
        <th scope="row" data-label="Student">
          <strong>{booking.studentName}</strong>
          <span>{booking.studentVolunteerId}</span>
        </th>
        <td data-label="Chapter">
          {isSupplementalChapter(booking.chapterName) ? (
            <strong>{booking.chapterName}</strong>
          ) : (
            <>
              <strong>Ch {booking.chapterNumber ?? "-"}</strong>
              <span>{booking.chapterName ?? ""}</span>
            </>
          )}
        </td>
        <td data-label="Sloka Range">{booking.slokaCount ?? "-"}</td>
        <td data-label="Exam Date">
          <time dateTime={booking.date ?? undefined}>
            {booking.formattedDate ?? booking.date ?? "-"}
          </time>
        </td>
        <td data-label="Grades">
          {booking.cancelled ? (
            <span className="teacher-badge teacher-badge--cancelled">
              Cancelled
            </span>
          ) : (
            <div className="teacher-inline-grades">
              <label>
                <span>Mem</span>
                <select
                  aria-label={`Memorization grade for ${booking.studentName}`}
                  value={memorizationGrade}
                  onChange={(event) =>
                    setMemorizationGrade(event.target.value)
                  }
                >
                  <option value="">—</option>
                  {grades.map((grade) => (
                    <option key={`mem-${grade}`} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Pro</span>
                <select
                  aria-label={`Pronunciation grade for ${booking.studentName}`}
                  value={pronunciationGrade}
                  onChange={(event) =>
                    setPronunciationGrade(event.target.value)
                  }
                >
                  <option value="">—</option>
                  {grades.map((grade) => (
                    <option key={`pro-${grade}`} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
        </td>
        <td data-label="Details">
          <button
            className={`teacher-detail-toggle${
              comment.trim() ? " teacher-detail-toggle--has-comment" : ""
            }`}
            type="button"
            aria-expanded={expanded}
            aria-controls={detailsId}
            onClick={onToggle}
          >
            <span aria-hidden="true">{comment.trim() ? "●" : "○"}</span>
            {expanded ? "Hide" : comment.trim() ? "Comment" : "Details"}
          </button>
        </td>
        <td data-label="Save">
          {!booking.cancelled && (
            <button
              className="teacher-button teacher-button--primary teacher-row-save"
              type="button"
              disabled={saving || !changed}
              onClick={() =>
                void onSave({
                  bookingId: booking.id,
                  memorizationGrade,
                  pronunciationGrade,
                  comment,
                })
              }
            >
              {saving ? "Saving…" : "Save"}
            </button>
          )}
          {feedback && (
            <span
              className={`teacher-row-status teacher-row-status--${feedback.type}`}
              role={feedback.type === "error" ? "alert" : "status"}
              title={feedback.message}
            >
              {feedback.type === "success" ? "Saved" : "Error"}
            </span>
          )}
        </td>
      </tr>
      {expanded && (
        <tr className="teacher-grading-details" id={detailsId}>
          <td colSpan={7}>
            <div>
              <label>
                Comments
                <textarea
                  rows={2}
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Add grading comments"
                />
              </label>
              <dl>
                <div>
                  <dt>Slot</dt>
                  <dd>{booking.slotName ?? "-"}</dd>
                </div>
                <div>
                  <dt>Student phone</dt>
                  <dd>
                    {booking.studentPhone ? (
                      <a href={`tel:${booking.studentPhone}`}>
                        {booking.studentPhone}
                      </a>
                    ) : (
                      "-"
                    )}
                  </dd>
                </div>
              </dl>
              {feedback && <p>{feedback.message}</p>}
            </div>
          </td>
        </tr>
      )}
    </Fragment>
  );
}

export default GradeEditor;
