import { useCallback, useState } from "react";

import studentService from "../services/StudentService";
import type { BookStudentSlotRequest } from "../types/api";
import { getStudentApiError, useStudentResource } from "../hooks/useStudentResource";
import SlotBookingForm from "../components/SlotBookingForm";
import StudentCard from "../components/StudentCard";
import StudentPageHeader from "../components/StudentPageHeader";
import StudentState from "../components/StudentState";
import "../styles/student.css";

function StudentSlotsPage() {
  const load = useCallback(() => studentService.getSlots(), []);
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
      const response = await studentService.bookSlot(request);
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
      const response = await studentService.cancelBooking({ bookingId });
      setMessage(response.message);
      await reload();
    } catch (requestError: unknown) {
      setActionError(getStudentApiError(requestError, "Failed to cancel booking."));
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="student-page">
      <StudentPageHeader title="Book Test Slot" description="Select your test slot and syllabus for the next Sunday." />
      {loading && <StudentState type="loading" message="Loading slots..." />}
      {!loading && error && <StudentState type="error" message={error} onRetry={() => void reload()} />}
      {!loading && data && (
        <>
          <div className="student-date-badge"><span>Next Sunday</span><strong>{data.formattedDate}</strong></div>
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
            <StudentCard title="Book a Slot">
              <SlotBookingForm
                chapters={data.chapters}
                slots={data.slots}
                submitting={submitting}
                onSubmit={book}
              />
            </StudentCard>
          )}
          <StudentCard title="Your Bookings" label={String(data.existingBookingsCount)}>
            {data.existingBookings.length === 0 ? (
              <StudentState type="empty" message="No bookings found for the next Sunday." />
            ) : (
              <ul className="student-bookings">
                {data.existingBookings.map((booking) => (
                  <li key={booking.id}>
                    <div>
                      <strong>{booking.slotName ?? "Slot"}</strong>
                      <span>Ch {booking.chapterNumber} - {booking.chapterName}</span>
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
