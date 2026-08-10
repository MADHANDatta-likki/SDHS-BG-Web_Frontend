import { useCallback, useState } from "react";

import { formatChapterLabel } from "../../../utils/chapterLabel";
import studentService from "../services/StudentService";
import type { BookStudentSlotRequest } from "../types/api";
import { getStudentApiError, useStudentResource } from "../hooks/useStudentResource";
import SlotBookingForm from "../components/SlotBookingForm";
import StudentCard from "../components/StudentCard";
import StudentPageHeader from "../components/StudentPageHeader";
import StudentState from "../components/StudentState";
import CurrentEnrollmentSummary from "../../enrollment/components/CurrentEnrollmentSummary";
import { useEnrollment } from "../../../hooks/useEnrollment";
import "../styles/student.css";

function StudentSlotsPage() {
  const { selectedEnrollment } = useEnrollment();
  const enrollmentId = (selectedEnrollment?.enrollmentId ?? selectedEnrollment?.id)!;
  const load = useCallback(
    () => studentService.getSlots(enrollmentId),
    [enrollmentId],
  );
  const { data, error, loading, reload } = useStudentResource(load, "Failed to load slot data.");
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const book = async (request: BookStudentSlotRequest) => {
    setSubmitting(true);
    setActionError("");
    setMessage("");
    try {
      const response = await studentService.bookSlot(request, enrollmentId);
      setMessage(response.message);
      await reload();
    } catch (requestError: unknown) {
      setActionError(getStudentApiError(requestError, "Failed to book slot."));
    } finally {
      setSubmitting(false);
    }
  };

  const cancel = async (bookingId: number) => {
    setCancellingId(bookingId);
    setActionError("");
    setMessage("");
    try {
      const response = await studentService.cancelBooking(
        { bookingId },
        enrollmentId,
      );
      setMessage(response.message);
      await reload();
    } catch (requestError: unknown) {
      setActionError(getStudentApiError(requestError, "Failed to cancel booking."));
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="student-page student-journey-page student-booking-page">
      <StudentPageHeader title="Book Exam Slot" description="Prepare your syllabus and choose an available examination time." />
      <CurrentEnrollmentSummary />
      {loading && <StudentState type="loading" message="Loading slots..." />}
      {!loading && error && <StudentState type="error" message={error} onRetry={() => void reload()} />}
      {!loading && data && (
        <>
          <div className="student-date-badge"><span>Upcoming Exam</span><strong>{data.formattedDate}</strong></div>
          {actionError && <div className="student-alert student-alert--error" role="alert">{actionError}</div>}
          {message && <div className="student-alert student-alert--success" role="status">{message}</div>}
          {!data.slotEligible && (
            <div className="student-alert student-alert--warning" role="status">
              You are not eligible to book a slot at this time. Please contact your teacher for more information.
            </div>
          )}
          {data.slotEligible && !data.bookingAllowed && (
            <div className="student-alert student-alert--info" role="status">
              Booking window has closed for this week. Please try again next week before the cutoff time.
            </div>
          )}
          {data.slotEligible && data.bookingAllowed && (
            <StudentCard title="Prepare Your Examination">
              {data.slots.length === 0 ? (
                <StudentState
                  type="empty"
                  message="No exam time windows are available for the upcoming Sunday. Please check again later."
                />
              ) : data.chapters.length === 0 ? (
                <StudentState
                  type="empty"
                  message="No chapters are available for this examination yet. Please check again later."
                />
              ) : (
                <SlotBookingForm
                  chapters={data.chapters}
                  slots={data.slots}
                  submitting={submitting}
                  onSubmit={book}
                />
              )}
            </StudentCard>
          )}
          <StudentCard title="Your Bookings" label={String(data.existingBookingsCount)}>
            {data.existingBookings.length === 0 ? (
              <StudentState
                type="empty"
                message="You have no booking for the upcoming Sunday. Choose an available time window above when booking is open."
              />
            ) : (
              <ul className="student-bookings">
                {data.existingBookings.map((booking) => (
                  <li key={booking.id}>
                    <div>
                      <strong>{booking.slotName ?? "Slot"}</strong>
                      <span>{formatChapterLabel(booking.chapterNumber, booking.chapterName, "Ch")}</span>
                      <span>{booking.slokaCount} sloka{booking.slokaCount === 1 ? "" : "s"} · {booking.date}</span>
                    </div>
                    {!booking.cancelled && (
                      <button
                        className="student-button student-button--danger"
                        type="button"
                        disabled={cancellingId === booking.id}
                        onClick={() => void cancel(booking.id)}
                        aria-label={`Cancel booking for ${booking.slotName ?? "selected slot"}`}
                      >
                        {cancellingId === booking.id ? "Cancelling..." : "Cancel"}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </StudentCard>
        </>
      )}
    </div>
  );
}

export default StudentSlotsPage;
