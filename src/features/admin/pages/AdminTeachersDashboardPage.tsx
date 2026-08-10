import { useCallback, useState } from "react";
import AdminDashboardRow from "../components/AdminDashboardRow";
import AdminCard from "../components/AdminCard";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminState from "../components/AdminState";
import { getAdminApiError, useAdminResource } from "../hooks/useAdminResource";
import adminService from "../services/AdminService";
import type { SaveDashboardRowRequest } from "../types/api";
import "../styles/admin.css";

const iso = () => { const date = new Date(); date.setDate(date.getDate() + ((7 - date.getDay()) % 7)); return date.toISOString().slice(0, 10); };
function AdminTeachersDashboardPage() {
  const [date, setDate] = useState(iso()); const [teacherId, setTeacherId] = useState("");
  const load = useCallback(() => adminService.getTeachersDashboard({ date, ...(teacherId ? { teacherId } : {}) }), [date, teacherId]);
  const { data, loading, error, reload } = useAdminResource(load, "Failed to load teachers dashboard.");
  const [working, setWorking] = useState<number | null>(null); const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const save = async (request: SaveDashboardRowRequest) => { setWorking(request.bookingId); setNotice(null); try { const response = await adminService.saveDashboardRow(request); setNotice({ type: "success", text: response.message }); await reload(); } catch (e: unknown) { setNotice({ type: "error", text: getAdminApiError(e, "Failed to save booking.") }); } finally { setWorking(null); } };
  const remove = async (bookingId: number) => { if (!window.confirm("Delete this booking?")) return; setWorking(bookingId); setNotice(null); try { const response = await adminService.deleteDashboardRow({ bookingId }); setNotice({ type: "success", text: response.message }); await reload(); } catch (e: unknown) { setNotice({ type: "error", text: getAdminApiError(e, "Failed to delete booking.") }); } finally { setWorking(null); } };
  return <div className="admin-page"><AdminPageHeader title="Teachers Dashboard" />{notice && <div className={`admin-alert admin-alert--${notice.type}`}>{notice.text}</div>}<AdminCard title="Filters"><div className="admin-filter-grid"><label className="admin-field">Date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label><label className="admin-field">Teacher<select value={teacherId} onChange={(e) => setTeacherId(e.target.value)}><option value="">All Teachers</option>{data?.teachers.map((teacher) => <option key={teacher.volunteerId} value={teacher.volunteerId}>{teacher.name}</option>)}</select></label></div></AdminCard>{loading && <AdminState type="loading" message="Loading teacher bookings..." />}{!loading && error && <AdminState type="error" message={error} onRetry={() => void reload()} />}{!loading && data && <AdminCard title="Bookings" label={String(data.bookings.length)}>{data.bookings.length === 0 ? <AdminState type="empty" message="No bookings found for this date and teacher." /> : <div className="admin-booking-list">{data.bookings.map((booking) => <AdminDashboardRow key={booking.id} booking={booking} teachers={data.teachers} grades={data.grades} working={working === booking.id} onSave={save} onDelete={remove} />)}</div>}</AdminCard>}</div>;
}
export default AdminTeachersDashboardPage;
