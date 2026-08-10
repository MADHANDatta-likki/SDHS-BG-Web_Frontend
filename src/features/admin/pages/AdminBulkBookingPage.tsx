import { useCallback, useEffect, useState } from "react";
import {
  formatChapterLabel,
  isSupplementalChapter,
} from "../../../utils/chapterLabel";
import AdminCard from "../components/AdminCard";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminState from "../components/AdminState";
import { getAdminApiError, useAdminResource } from "../hooks/useAdminResource";
import adminService from "../services/AdminService";
import type { BulkBookingEntry } from "../types/api";
import "../styles/admin.css";

const iso = () => { const date = new Date(); date.setDate(date.getDate() + ((7 - date.getDay()) % 7)); return date.toISOString().slice(0, 10); };
function AdminBulkBookingPage() {
  const [date, setDate] = useState(iso());
  const load = useCallback(() => adminService.getBulkBooking({ date }), [date]);
  const { data, loading, error, reload } = useAdminResource(load, "Failed to load bulk booking.");
  const [student, setStudent] = useState(""); const [slot, setSlot] = useState(""); const [chapter, setChapter] = useState(""); const [count, setCount] = useState("");
  const [second, setSecond] = useState(false); const [chapter2, setChapter2] = useState(""); const [count2, setCount2] = useState("");
  const [allowed, setAllowed] = useState<number[]>([]); const [allowed2, setAllowed2] = useState<number[]>([]);
  const [entries, setEntries] = useState<BulkBookingEntry[]>([]); const [working, setWorking] = useState(false); const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const pendingChapterLabel = (chapterId: number) => {
    const pendingChapter = data?.chapters.find((item) => item.id === chapterId);
    return pendingChapter && isSupplementalChapter(pendingChapter.chapterName)
      ? pendingChapter.chapterName
      : `Chapter ${chapterId}`;
  };
  useEffect(() => { if (!student || !chapter) return setAllowed([]); void adminService.getAllowedSlokas({ volunteerId: student, date, chapterId: Number(chapter) }).then((r) => setAllowed(r.allowed)).catch(() => setAllowed([])); }, [student, date, chapter]);
  useEffect(() => { if (!student || !chapter2) return setAllowed2([]); void adminService.getAllowedSlokas({ volunteerId: student, date, chapterId: Number(chapter2) }).then((r) => setAllowed2(r.allowed)).catch(() => setAllowed2([])); }, [student, date, chapter2]);
  const stage = () => { if (!student || !slot || !chapter || !count) return setNotice({ type: "error", text: "Student, slot, chapter, and sloka count are required." }); if (allowed.length > 0 && !allowed.includes(Number(count))) return setNotice({ type: "error", text: `Allowed sloka counts: ${allowed.join(", ")}.` }); if (second && (!chapter2 || !count2)) return setNotice({ type: "error", text: "Second chapter and sloka count are required." }); const entry: BulkBookingEntry = { volunteerId: student, date, slotId: Number(slot), chapterId: Number(chapter), slokaCount: Number(count), ...(second ? { chapterId2: Number(chapter2), slokaCount2: Number(count2) } : {}) }; setEntries((current) => [...current, entry]); setNotice(null); };
  const save = async () => { if (entries.length === 0) return; setWorking(true); setNotice(null); try { const response = await adminService.saveBulkBooking({ entries }); const detail = response.messages.length ? ` ${response.messages.join(" ")}` : ""; setNotice({ type: response.failed ? "error" : "success", text: `${response.saved} saved, ${response.failed} failed.${detail}` }); if (!response.failed) setEntries([]); await reload(); } catch (e: unknown) { setNotice({ type: "error", text: getAdminApiError(e, "Failed to save bookings.") }); } finally { setWorking(false); } };
  const remove = async (bookingId: number) => { if (!window.confirm("Delete this booking?")) return; setWorking(true); try { const response = await adminService.deleteBulkBooking({ bookingId }); setNotice({ type: "success", text: response.message }); await reload(); } catch (e: unknown) { setNotice({ type: "error", text: getAdminApiError(e, "Failed to delete booking.") }); } finally { setWorking(false); } };
  return (
    <div className="admin-page">
      <AdminPageHeader title="Student Slot Booking" />
      {notice && <div className={`admin-alert admin-alert--${notice.type}`} role={notice.type === "error" ? "alert" : "status"}>{notice.text}</div>}
      <AdminCard title="Date">
        <label className="admin-field">Booking date<input type="date" value={date} onChange={(event) => { setDate(event.target.value); setEntries([]); }} /></label>
      </AdminCard>
      {loading && <AdminState type="loading" message="Loading booking options..." />}
      {!loading && error && <AdminState type="error" message={error} onRetry={() => void reload()} />}
      {!loading && data && (
        <>
          <AdminCard title="Add Booking">
            <div className="admin-form-grid">
              <label className="admin-field">Student<select value={student} onChange={(event) => setStudent(event.target.value)}><option value="">Select student</option>{data.students.map((item) => <option key={item.volunteerId} value={item.volunteerId}>{item.name} ({item.volunteerId})</option>)}</select></label>
              <label className="admin-field">Slot<select value={slot} onChange={(event) => setSlot(event.target.value)}><option value="">Select slot</option>{data.slots.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
              <label className="admin-field">Chapter<select value={chapter} onChange={(event) => setChapter(event.target.value)}><option value="">Select chapter</option>{data.chapters.map((item) => <option key={item.id} value={item.id}>{formatChapterLabel(item.chapterNumber, item.chapterName, "Ch")}</option>)}</select></label>
              <label className="admin-field">Sloka Count<select value={count} onChange={(event) => setCount(event.target.value)}><option value="">Select count</option>{allowed.map((value) => <option key={value}>{value}</option>)}</select></label>
              <label className="admin-check"><input type="checkbox" checked={second} onChange={(event) => setSecond(event.target.checked)} />Add second chapter</label>
              {second && <><label className="admin-field">Second Chapter<select value={chapter2} onChange={(event) => setChapter2(event.target.value)}><option value="">Select chapter</option>{data.chapters.map((item) => <option key={item.id} value={item.id}>{formatChapterLabel(item.chapterNumber, item.chapterName, "Ch")}</option>)}</select></label><label className="admin-field">Second Sloka Count<select value={count2} onChange={(event) => setCount2(event.target.value)}><option value="">Select count</option>{allowed2.map((value) => <option key={value}>{value}</option>)}</select></label></>}
            </div>
            <button className="admin-button admin-button--secondary" type="button" onClick={stage}>Add to Batch</button>
          </AdminCard>
          <AdminCard title="Pending Batch" label={String(entries.length)}>
            {entries.length === 0 ? <AdminState type="empty" message="No bookings added to this batch." /> : <ul className="admin-batch">{entries.map((entry, index) => <li key={`${entry.volunteerId}-${index}`}><span>{entry.volunteerId} · Slot {entry.slotId} · {pendingChapterLabel(entry.chapterId)} · {entry.slokaCount}</span><button className="admin-link-button" type="button" onClick={() => setEntries((current) => current.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Remove staged booking for ${entry.volunteerId}`}>Remove</button></li>)}</ul>}
            <button className="admin-button admin-button--primary" type="button" disabled={working || entries.length === 0} onClick={() => void save()}>{working ? "Saving..." : "Save Bookings"}</button>
          </AdminCard>
          <AdminCard title="Existing Bookings" label={String(data.bookings.length)}>
            {data.bookings.length === 0 ? <AdminState type="empty" message="No bookings found for this date." /> : <div className="admin-table-wrap"><table className="admin-table"><caption className="sr-only">Existing student bookings for {date}</caption><thead><tr><th scope="col">Student</th><th scope="col">Slot</th><th scope="col">Chapter</th><th scope="col">Slokas</th><th scope="col">Teacher</th><th scope="col">Actions</th></tr></thead><tbody>{data.bookings.map((booking) => <tr key={booking.id}><td>{booking.studentName}<small>{booking.volunteerId}</small></td><td>{booking.slotName}</td><td>{isSupplementalChapter(booking.chapterName) ? booking.chapterName : `${booking.chapterNumber} ${booking.chapterName}`}</td><td>{booking.slokaCount}</td><td>{booking.assignedTeacherName ?? "-"}</td><td><button className="admin-link-button admin-link-button--danger" type="button" disabled={working} onClick={() => void remove(booking.id)} aria-label={`Delete booking for ${booking.studentName}`}>Delete</button></td></tr>)}</tbody></table></div>}
          </AdminCard>
        </>
      )}
    </div>
  );
}
export default AdminBulkBookingPage;
