import { useCallback, useEffect, useMemo, useState } from "react";

import { isSupplementalChapter } from "../../../utils/chapterLabel";
import DashboardPageHeader from "../../../components/common/DashboardPageHeader";
import GradeEditor from "../components/GradeEditor";
import TeacherCard from "../components/TeacherCard";
import TeacherState from "../components/TeacherState";
import {
  getTeacherApiError,
  useTeacherResource,
} from "../hooks/useTeacherResource";
import teacherService from "../services/TeacherService";
import type { UpdateGradeRequest } from "../types/api";
import "../styles/teacher.css";

type Feedback = Record<number, { type: "success" | "error"; message: string }>;

function TeacherGradingPage() {
  const load = useCallback(() => teacherService.getDashboard(), []);
  const { data, error, loading, reload, setData } = useTeacherResource(
    load,
    "Failed to load dashboard.",
  );
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [expandedBooking, setExpandedBooking] = useState<number | null>(null);
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [feedback, setFeedback] = useState<Feedback>({});

  const dates = useMemo(
    () =>
      [
        ...new Set(
          (data?.bookings ?? [])
            .map((booking) => booking.date)
            .filter((date): date is string => Boolean(date)),
        ),
      ].sort((left, right) => right.localeCompare(left)),
    [data?.bookings],
  );

  const chapters = useMemo(
    () =>
      [
        ...new Map(
          (data?.bookings ?? [])
            .filter((booking) => booking.chapterNumber !== undefined)
            .map((booking) => [
              String(booking.chapterNumber),
              isSupplementalChapter(booking.chapterName)
                ? booking.chapterName ?? ""
                : `Chapter ${booking.chapterNumber}${
                    booking.chapterName ? ` — ${booking.chapterName}` : ""
                  }`,
            ]),
        ).entries(),
      ].sort(([left], [right]) => Number(left) - Number(right)),
    [data?.bookings],
  );

  useEffect(() => {
    if (selectedDate === "" && dates.length > 0) {
      setSelectedDate(dates[0]);
    }
  }, [dates, selectedDate]);

  const bookings = useMemo(() => {
    const query = search.trim().toLowerCase();
    return [...(data?.bookings ?? [])]
      .filter(
        (booking) =>
          (selectedDate === "" || booking.date === selectedDate) &&
          (selectedChapter === "" ||
            String(booking.chapterNumber) === selectedChapter) &&
          (query === "" ||
            booking.studentName.toLowerCase().includes(query) ||
            booking.studentVolunteerId.toLowerCase().includes(query)),
      )
      .sort(
        (left, right) =>
          (right.date ?? "").localeCompare(left.date ?? "") ||
          left.studentName.localeCompare(right.studentName),
      );
  }, [data?.bookings, search, selectedChapter, selectedDate]);

  const save = async (request: UpdateGradeRequest) => {
    setSaving((current) => ({ ...current, [request.bookingId]: true }));
    setFeedback((current) => {
      const next = { ...current };
      delete next[request.bookingId];
      return next;
    });
    try {
      const response = await teacherService.updateGrade(request);
      if (!response.ok) throw new Error(response.message);
      setData((current) =>
        current
          ? {
              ...current,
              bookings: current.bookings.map((booking) =>
                booking.id === request.bookingId
                  ? {
                      ...booking,
                      memorizationGrade: request.memorizationGrade || null,
                      pronunciationGrade: request.pronunciationGrade || null,
                      teacherComment: request.comment || null,
                    }
                  : booking,
              ),
            }
          : current,
      );
      setFeedback((current) => ({
        ...current,
        [request.bookingId]: {
          type: "success",
          message: response.message,
        },
      }));
    } catch (saveError: unknown) {
      const message =
        saveError instanceof Error && !("response" in saveError)
          ? saveError.message
          : getTeacherApiError(saveError, "Failed to save grade.");
      setFeedback((current) => ({
        ...current,
        [request.bookingId]: { type: "error", message },
      }));
    } finally {
      setSaving((current) => ({ ...current, [request.bookingId]: false }));
    }
  };

  const total = data?.bookings.length ?? 0;
  const graded =
    data?.bookings.filter((booking) =>
      Boolean(booking.memorizationGrade?.trim()),
    ).length ?? 0;

  return (
    <div className="teacher-page teacher-page--grading">
      <DashboardPageHeader
        title="Exam Grading"
        subtitle="Review assigned examinations and complete pending student evaluations."
        action={<button
          className="teacher-button teacher-button--secondary"
          type="button"
          onClick={() => void reload()}
        >
          Refresh
        </button>}
      />
      {!loading && data && (
        <div className="teacher-stats teacher-stats--compact">
          <div>
            <strong>{total}</strong>
            <span>Total Bookings</span>
          </div>
          <div>
            <strong>{graded}</strong>
            <span>Graded</span>
          </div>
          <div>
            <strong>{total - graded}</strong>
            <span>Pending</span>
          </div>
        </div>
      )}
      <TeacherCard
        title="Assigned Exams & Pending Grading"
        label={`${bookings.length} booking${bookings.length === 1 ? "" : "s"}`}
      >
        <div className="teacher-grading-toolbar" role="search">
          <label>
            Exam date
            <select
              value={selectedDate}
              onChange={(event) => {
                setSelectedDate(event.target.value);
                setExpandedBooking(null);
              }}
            >
              {dates.length === 0 && <option value="">No dates</option>}
              {dates.map((date) => (
                <option key={date} value={date}>
                  {date}
                </option>
              ))}
            </select>
          </label>
          <label>
            Student
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name or volunteer ID"
            />
          </label>
          <label>
            Chapter
            <select
              value={selectedChapter}
              onChange={(event) => setSelectedChapter(event.target.value)}
            >
              <option value="">All chapters</option>
              {chapters.map(([chapter, label]) => (
                <option key={chapter} value={chapter}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        {loading && (
          <TeacherState type="loading" message="Loading assigned bookings..." />
        )}
        {!loading && error && (
          <TeacherState
            type="error"
            message={error}
            onRetry={() => void reload()}
          />
        )}
        {!loading && data && bookings.length === 0 && (
          <TeacherState
            type="empty"
            message="No bookings match the selected filters."
          />
        )}
        {!loading && bookings.length > 0 && (
          <div className="teacher-grading-table-wrap">
            <table className="teacher-grading-table">
              <caption className="sr-only">Assigned examinations matching the selected grading filters</caption>
              <thead>
                <tr>
                  <th scope="col">Student</th>
                  <th scope="col">Chapter</th>
                  <th scope="col">Sloka Range</th>
                  <th scope="col">Exam Date</th>
                  <th scope="col">Grades</th>
                  <th scope="col">Comments</th>
                  <th scope="col">Save</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <GradeEditor
                    key={booking.id}
                    booking={booking}
                    grades={data?.gradesList ?? []}
                    saving={Boolean(saving[booking.id])}
                    feedback={feedback[booking.id]}
                    expanded={expandedBooking === booking.id}
                    onToggle={() =>
                      setExpandedBooking((current) =>
                        current === booking.id ? null : booking.id,
                      )
                    }
                    onSave={save}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </TeacherCard>
    </div>
  );
}

export default TeacherGradingPage;
