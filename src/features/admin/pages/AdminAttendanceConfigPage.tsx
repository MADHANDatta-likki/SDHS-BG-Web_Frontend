import { useCallback, useState } from "react";

import AdminCard from "../components/AdminCard";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminState from "../components/AdminState";
import { getAdminApiError, useAdminResource } from "../hooks/useAdminResource";
import adminService from "../services/AdminService";
import "../styles/admin.css";

function AdminAttendanceConfigPage() {
  const load = useCallback(() => adminService.getAttendanceConfig(), []);
  const { data, setData, loading, error, reload } = useAdminResource(load, "Failed to load attendance configuration.");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const patch = (groupId: string, field: "groupName" | "startDate" | "endDate" | "status", value: string) =>
    setData((current) => current ? {
      groups: current.groups.map((group) => group.groupId === groupId ? { ...group, [field]: value } : group),
    } : current);

  const save = async () => {
    if (!data) return;
    setSaving(true);
    setNotice(null);
    try {
      const response = await adminService.saveAttendanceConfig({
        groups: data.groups.map((group) => ({
          groupId: group.groupId,
          groupName: group.groupName ?? "",
          startDate: group.startDate ?? "",
          endDate: group.endDate,
          status: group.status,
        })),
      });
      setNotice({ type: "success", text: response.message });
      await reload();
    } catch (requestError: unknown) {
      setNotice({ type: "error", text: getAdminApiError(requestError, "Failed to save attendance configuration.") });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page">
      <AdminPageHeader title="Attendance Config" />
      {notice && <div className={`admin-alert admin-alert--${notice.type}`} role={notice.type === "error" ? "alert" : "status"}>{notice.text}</div>}
      {loading && <AdminState type="loading" message="Loading groups..." />}
      {!loading && error && <AdminState type="error" message={error} onRetry={() => void reload()} />}
      {!loading && data && (
        <AdminCard title="Groups" label={String(data.groups.length)}>
          {data.groups.length === 0 ? <AdminState type="empty" message="No attendance groups configured." /> : (
            <div className="admin-table-wrap">
              <table className="admin-table admin-table--inputs">
                <caption className="sr-only">Attendance group configuration</caption>
                <thead><tr><th scope="col">Group ID</th><th scope="col">Group Name</th><th scope="col">Start Date</th><th scope="col">End Date</th><th scope="col">Status</th></tr></thead>
                <tbody>{data.groups.map((group) => (
                  <tr key={group.groupId}>
                    <th scope="row">{group.groupId}</th>
                    <td><input aria-label={`Group name for ${group.groupId}`} value={group.groupName ?? ""} onChange={(event) => patch(group.groupId, "groupName", event.target.value)} /></td>
                    <td><input aria-label={`Start date for ${group.groupId}`} type="date" value={group.startDate ?? ""} onChange={(event) => patch(group.groupId, "startDate", event.target.value)} /></td>
                    <td><input aria-label={`End date for ${group.groupId}`} type="date" value={group.endDate ?? ""} onChange={(event) => patch(group.groupId, "endDate", event.target.value)} /></td>
                    <td><select aria-label={`Status for ${group.groupId}`} value={group.status} onChange={(event) => patch(group.groupId, "status", event.target.value)}><option>ACTIVE</option><option>COMPLETED</option><option>INACTIVE</option></select></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
          <button className="admin-button admin-button--primary" type="button" disabled={saving} onClick={() => void save()}>{saving ? "Saving..." : "Save Configuration"}</button>
        </AdminCard>
      )}
    </div>
  );
}

export default AdminAttendanceConfigPage;
