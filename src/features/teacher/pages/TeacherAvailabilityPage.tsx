import { useCallback, useState } from "react";

import DashboardPageHeader from "../../../components/common/DashboardPageHeader";
import TeacherCard from "../components/TeacherCard";
import TeacherState from "../components/TeacherState";
import { getTeacherApiError, useTeacherResource } from "../hooks/useTeacherResource";
import teacherService from "../services/TeacherService";
import "../styles/teacher.css";

function TeacherAvailabilityPage() {
  const load = useCallback(() => teacherService.getMyAvailability(), []);
  const { data, setData, loading, error, reload } = useTeacherResource(
    load,
    "Failed to load your availability.",
  );
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const toggleSlot = (slotId: number) => {
    setData((current) => current ? {
      ...current,
      selectedSlotIds: current.selectedSlotIds.includes(slotId)
        ? current.selectedSlotIds.filter((id) => id !== slotId)
        : [...current.selectedSlotIds, slotId],
    } : current);
  };

  const save = async () => {
    if (!data) return;
    setSaving(true);
    setNotice(null);
    try {
      const response = await teacherService.saveMyAvailability({
        examDate: data.examDate,
        slotIds: data.selectedSlotIds,
      });
      await reload();
      setNotice({ type: "success", message: response.message });
    } catch (saveError: unknown) {
      setNotice({
        type: "error",
        message: getTeacherApiError(saveError, "Failed to save your availability."),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="teacher-page">
      <DashboardPageHeader title="My Availability" subtitle="Choose the time windows when you can conduct the upcoming examination." />
      {notice && <div className={`teacher-alert teacher-alert--${notice.type}`} role={notice.type === "error" ? "alert" : "status"}>{notice.message}</div>}
      {loading && <TeacherState type="loading" message="Loading your availability..." />}
      {!loading && error && <TeacherState type="error" message={error} onRetry={() => void reload()} />}
      {!loading && data && (
        <>
        <section className="teacher-operations-section" aria-labelledby="availability-summary-title">
          <div className="teacher-section-heading"><div><h2 id="availability-summary-title">Availability Status</h2><p>Your readiness for the upcoming Sunday examination.</p></div></div>
          <div className="teacher-stats teacher-stats--compact">
            <div><strong>{data.examDate}</strong><span>Upcoming Sunday</span></div>
            <div><strong>{data.selectedSlotIds.length > 0 ? "Submitted" : "Pending"}</strong><span>Status</span></div>
            <div><strong>{data.selectedSlotIds.length}</strong><span>Selected Windows</span></div>
          </div>
        </section>
        <TeacherCard title="Edit Availability" label={data.examDate}>
          <div className="teacher-availability-date"><span>Exam Date</span><strong>{data.examDate}</strong></div>
          <fieldset className="teacher-availability-slots">
            <legend>Available time windows</legend>
            <div className="teacher-availability-grid">
              {data.availableSlots.map((slot) => (
                <label className="teacher-availability-option" key={slot.id}>
                  <input type="checkbox" checked={data.selectedSlotIds.includes(slot.id)} disabled={saving} onChange={() => toggleSlot(slot.id)} />
                  <span>{slot.name}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="teacher-save-row">
            <span>Clear every checkbox to remove your availability for this exam.</span>
            <button className="teacher-button teacher-button--primary" type="button" disabled={saving} onClick={() => void save()}>{saving ? "Saving..." : "Save Availability"}</button>
          </div>
        </TeacherCard>
        </>
      )}
    </div>
  );
}

export default TeacherAvailabilityPage;
