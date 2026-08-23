import { useCallback, useState } from "react";

import AdminCard from "../components/AdminCard";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminState from "../components/AdminState";
import { getAdminApiError, useAdminResource } from "../hooks/useAdminResource";
import adminService from "../services/AdminService";
import type { TeacherAvailability } from "../types/api";
import "../styles/admin.css";

const nextSunday = () => {
  const date = new Date();
  date.setDate(date.getDate() + ((7 - date.getDay()) % 7));
  return date.toISOString().slice(0, 10);
};

function AdminTeacherAvailabilityPage() {
  const [date, setDate] = useState(nextSunday());
  const load = useCallback(
    () => adminService.getTeacherAvailability({ date }),
    [date],
  );
  const { data, loading, error, reload } = useAdminResource(
    load,
    "Failed to load teacher availability.",
  );
  const [editingVid, setEditingVid] = useState<string | null>(null);
  const [draftSlotIds, setDraftSlotIds] = useState<number[]>([]);
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  const startEditing = (teacher: TeacherAvailability) => {
    setEditingVid(teacher.volunteerId);
    setDraftSlotIds([...teacher.selectedSlotIds]);
    setNotice(null);
  };

  const cancelEditing = () => {
    setEditingVid(null);
    setDraftSlotIds([]);
  };

  const toggleSlot = (slotId: number) => {
    setDraftSlotIds((current) => current.includes(slotId)
      ? current.filter((id) => id !== slotId)
      : [...current, slotId]);
  };

  const save = async (teacher: TeacherAvailability) => {
    if (!data) return;
    setSaving(true);
    setNotice(null);
    try {
      const response = await adminService.saveTeacherAvailability({
        date: data.date,
        entries: [{
          volunteerId: teacher.volunteerId,
          slotIds: draftSlotIds,
        }],
      });
      setEditingVid(null);
      setDraftSlotIds([]);
      setNotice({ type: "success", text: response.message });
      await reload();
    } catch (saveError: unknown) {
      setNotice({
        type: "error",
        text: getAdminApiError(
          saveError,
          "Failed to save availability.",
        ),
      });
    } finally {
      setSaving(false);
    }
  };

  const slotNames = (selectedSlotIds: number[]) =>
    data?.slots
      .filter((slot) => selectedSlotIds.includes(slot.id))
      .map((slot) => slot.name) ?? [];

  return (
    <div className="admin-page">
      <AdminPageHeader title="Teacher Availability" description="Plan teacher readiness for the upcoming examination and override availability when necessary." />
      <AdminCard title="Upcoming Sunday" label={data?.date ?? date}>
        <label className="admin-field admin-availability-date">Exam Date
          <input type="date" value={date} disabled={saving} onChange={(event) => {
            setDate(event.target.value);
            cancelEditing();
          }} />
        </label>
      </AdminCard>
      {notice && <div className={`admin-alert admin-alert--${notice.type}`} role={notice.type === "error" ? "alert" : "status"}>{notice.text}</div>}
      {loading && <AdminState type="loading" message="Loading teacher availability..." />}
      {!loading && error && <AdminState type="error" message={error} onRetry={() => void reload()} />}
      {!loading && data && (
        <>
          <div className="admin-section-heading"><div><h2>Availability Readiness</h2><p>Submitted and pending teacher availability for the selected examination date.</p></div></div>
          <section className="admin-stats" aria-label="Availability summary">
            <div><strong>{data.summary.teachers}</strong><span>Teachers</span></div>
            <div><strong>{data.summary.submitted}</strong><span>Submitted</span></div>
            <div><strong>{data.summary.pending}</strong><span>Pending</span></div>
            <div><strong>{data.summary.availabilityWindows}</strong><span>Availability Windows</span></div>
          </section>
          <div className="admin-availability-reminder-note admin-alert admin-alert--info" role="note">
            <strong>Reminder status</strong>
            <span>Reminder delivery is managed by the existing internal reminder workflow and is not changed from this page.</span>
          </div>
          <AdminCard title="Teachers" label={`${data.summary.submitted} of ${data.summary.teachers} submitted`}>
            {data.teachers.length === 0 ? (
              <AdminState type="empty" message="No teachers found." />
            ) : (
              <div className="admin-availability-list">
                {data.teachers.map((teacher) => {
                  const editing = editingVid === teacher.volunteerId;
                  const selectedNames = slotNames(teacher.selectedSlotIds);
                  return (
                    <article className="admin-availability-row" key={teacher.volunteerId}>
                      <div className="admin-availability-row__header">
                        <div><strong>{teacher.name}</strong><span>{teacher.volunteerId}</span>{teacher.phoneNumber && <span><a href={`tel:${teacher.phoneNumber}`} style={{ color: "inherit" }}>{teacher.phoneNumber}</a></span>}</div>
                        <span className={`admin-availability-status admin-availability-status--${teacher.status.toLowerCase()}`}>{teacher.status === "SUBMITTED" ? "Submitted" : "Pending"}</span>
                      </div>
                      <div className="admin-availability-row__windows">
                        {selectedNames.length > 0
                          ? selectedNames.map((name) => <span key={name}>{name}</span>)
                          : <em>No availability submitted.</em>}
                      </div>
                      {!editing && (
                        <button className="admin-button admin-button--secondary" type="button" disabled={saving || editingVid !== null} onClick={() => startEditing(teacher)}>Edit Availability</button>
                      )}
                      {editing && (
                        <div className="admin-availability-editor">
                          <div className="admin-check-grid">
                            {data.slots.map((slot) => (
                              <label className="admin-check" key={slot.id}>
                                <input type="checkbox" checked={draftSlotIds.includes(slot.id)} disabled={saving} onChange={() => toggleSlot(slot.id)} />
                                {slot.name}
                              </label>
                            ))}
                          </div>
                          <div className="admin-availability-editor__actions">
                            <button className="admin-button admin-button--primary" type="button" disabled={saving} onClick={() => void save(teacher)}>{saving ? "Saving..." : "Save Availability"}</button>
                            <button className="admin-button admin-button--secondary" type="button" disabled={saving} onClick={cancelEditing}>Cancel</button>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </AdminCard>
        </>
      )}
    </div>
  );
}

export default AdminTeacherAvailabilityPage;
