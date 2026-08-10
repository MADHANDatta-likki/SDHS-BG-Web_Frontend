import { useCallback, useState } from "react";
import AdminCard from "../components/AdminCard";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminState from "../components/AdminState";
import { getAdminApiError, useAdminResource } from "../hooks/useAdminResource";
import adminService from "../services/AdminService";
import type { Enrollment } from "../types/api";
import "../styles/admin.css";

interface ApprovalDraft {
  groupId: string;
  slotEligible: boolean;
  rejectionReason: string;
}

const emptyDraft: ApprovalDraft = {
  groupId: "",
  slotEligible: false,
  rejectionReason: "",
};

function formatPrograms(programs: Enrollment["currentActivePrograms"]): string {
  return programs.length > 0 ? programs.join(", ") : "None";
}

function formatRequestedDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function AdminEnrollmentsPage() {
  const load = useCallback(async () => {
    const [enrollments, attendanceConfig] = await Promise.all([
      adminService.getEnrollments(),
      adminService.getAttendanceConfig(),
    ]);
    return { enrollments, groups: attendanceConfig.groups };
  }, []);
  const { data, loading, error, reload } = useAdminResource(load, "Failed to load enrollments.");
  const [drafts, setDrafts] = useState<Record<number, ApprovalDraft>>({});
  const [working, setWorking] = useState<number | null>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const draftFor = (id: number): ApprovalDraft => drafts[id] ?? emptyDraft;
  const updateDraft = <K extends keyof ApprovalDraft>(id: number, key: K, value: ApprovalDraft[K]) => {
    setDrafts((current) => ({
      ...current,
      [id]: { ...(current[id] ?? emptyDraft), [key]: value },
    }));
  };

  const approve = async (id: number) => {
    const draft = draftFor(id);
    if (!draft.groupId) {
      setNotice({ type: "error", text: "Group is required for approval." });
      return;
    }
    setWorking(id);
    setNotice(null);
    try {
      await adminService.approveEnrollment(id, {
        groupId: draft.groupId,
        slotEligible: draft.slotEligible,
      });
      setNotice({ type: "success", text: "Enrollment approved." });
      await reload();
    } catch (requestError: unknown) {
      setNotice({ type: "error", text: getAdminApiError(requestError, "Failed to approve enrollment.") });
    } finally {
      setWorking(null);
    }
  };

  const reject = async (id: number) => {
    if (!window.confirm("Reject this enrollment?")) return;
    setWorking(id);
    setNotice(null);
    try {
      const reason = draftFor(id).rejectionReason.trim();
      await adminService.rejectEnrollment(id, reason ? { reason } : {});
      setNotice({ type: "success", text: "Enrollment rejected." });
      await reload();
    } catch (requestError: unknown) {
      setNotice({ type: "error", text: getAdminApiError(requestError, "Failed to reject enrollment.") });
    } finally {
      setWorking(null);
    }
  };

  const lifecycleAction = async (
    id: number,
    action: "complete" | "drop" | "default",
  ) => {
    const labels = { complete: "complete", drop: "drop", default: "make this the default" };
    if (!window.confirm(`Are you sure you want to ${labels[action]} enrollment?`)) return;
    setWorking(id);
    setNotice(null);
    try {
      if (action === "complete") await adminService.completeEnrollment(id);
      if (action === "drop") await adminService.dropEnrollment(id);
      if (action === "default") await adminService.switchDefaultEnrollment(id);
      const success = action === "default" ? "set as default" : action === "complete" ? "completed" : "dropped";
      setNotice({ type: "success", text: `Enrollment ${success} successfully.` });
      await reload();
    } catch (requestError: unknown) {
      setNotice({ type: "error", text: getAdminApiError(requestError, `Unable to ${action} enrollment.`) });
    } finally {
      setWorking(null);
    }
  };

  const enrollments = data?.enrollments.enrollments ?? [];
  return (
    <div className="admin-page">
      <AdminPageHeader title="Enrollment Management" description="Review pending requests and manage active enrollment lifecycles." />
      {notice && <div className={`admin-alert admin-alert--${notice.type}`} role="status">{notice.text}</div>}
      {loading && <AdminState type="loading" message="Loading enrollments..." />}
      {!loading && error && <AdminState type="error" message={error} onRetry={() => void reload()} />}
      {!loading && data && (
        <>
        <section className="admin-operations-section" aria-labelledby="enrollment-lifecycle-title">
          <div className="admin-section-heading"><div><h2 id="enrollment-lifecycle-title">Enrollment Lifecycle</h2><p>Pending requests flow into active learning after approval. Historical states remain read-only where supplied by the existing API.</p></div></div>
          <div className="admin-stats admin-enrollment-stats">
            <div><strong>{enrollments.length}</strong><span>Pending</span></div>
            <div><strong>{data.enrollments.activeEnrollments.length}</strong><span>Active</span></div>
          </div>
        </section>
        <AdminCard title="Pending Enrollments" label={String(enrollments.length)}>
          {enrollments.length === 0 ? <AdminState type="empty" message="No pending enrollments." /> : (
            <div className="admin-table-wrap">
              <table className="admin-table admin-table--enrollments">
                <caption className="sr-only">Pending enrollment requests awaiting administrator review</caption>
                <thead><tr><th>Volunteer</th><th>Program</th><th>Requested On</th><th>Current Active Programs</th><th>Current Pending Programs</th><th>Approval</th></tr></thead>
                <tbody>
                  {enrollments.map((item) => {
                    const draft = draftFor(item.enrollmentId);
                    const disabled = working === item.enrollmentId;
                    return (
                      <tr key={item.enrollmentId}>
                        <td>{item.volunteerName}<small>{item.volunteerId}</small></td>
                        <td>{item.programType}</td>
                        <td>{formatRequestedDate(item.requestedDate)}</td>
                        <td>{formatPrograms(item.currentActivePrograms)}</td>
                        <td>{formatPrograms(item.currentPendingPrograms)}</td>
                        <td>
                          <div className="admin-enrollment-actions">
                            <label className="admin-field">Group
                              <select value={draft.groupId} disabled={disabled} onChange={(event) => updateDraft(item.enrollmentId, "groupId", event.target.value)}>
                                <option value="">Select group</option>
                                {data.groups.map((group) => <option key={group.groupId} value={group.groupId}>{group.groupName ?? group.groupId}</option>)}
                              </select>
                            </label>
                            <div className="admin-check-grid">
                              <label className="admin-check"><input type="checkbox" checked={draft.slotEligible} disabled={disabled} onChange={(event) => updateDraft(item.enrollmentId, "slotEligible", event.target.checked)} />Slot eligible</label>
                            </div>
                            <label className="admin-field">Rejection reason (optional)
                              <input maxLength={400} value={draft.rejectionReason} disabled={disabled} onChange={(event) => updateDraft(item.enrollmentId, "rejectionReason", event.target.value)} />
                            </label>
                            <div className="admin-row-actions">
                              <button className="admin-button admin-button--primary" type="button" disabled={disabled} onClick={() => void approve(item.enrollmentId)}>Approve</button>
                              <button className="admin-button admin-button--danger" type="button" disabled={disabled} onClick={() => void reject(item.enrollmentId)}>Reject</button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </AdminCard>
        <AdminCard title="Active Enrollments" label={String(data.enrollments.activeEnrollments.length)}>
          {data.enrollments.activeEnrollments.length === 0 ? <AdminState type="empty" message="No active enrollments." /> : (
            <div className="admin-table-wrap">
              <table className="admin-table admin-table--enrollments">
                <caption className="sr-only">Active learning enrollments and available lifecycle actions</caption>
                <thead><tr><th>Volunteer</th><th>Program</th><th>Group</th><th>Default</th><th>Actions</th></tr></thead>
                <tbody>{data.enrollments.activeEnrollments.map((item) => {
                  const disabled = working === item.enrollmentId;
                  return <tr key={item.enrollmentId}>
                    <td>{item.volunteerName}<small>{item.volunteerId}</small></td>
                    <td>{item.programType}</td><td>{item.groupId ?? ""}</td>
                    <td>{item.defaultEnrollment ? "Yes" : "No"}</td>
                    <td><div className="admin-row-actions">
                      {!item.defaultEnrollment && <button className="admin-button admin-button--secondary" type="button" disabled={disabled} onClick={() => void lifecycleAction(item.enrollmentId, "default")}>Make Default</button>}
                      <button className="admin-button admin-button--secondary" type="button" disabled={disabled} onClick={() => void lifecycleAction(item.enrollmentId, "complete")}>Complete</button>
                      <button className="admin-button admin-button--danger" type="button" disabled={disabled} onClick={() => void lifecycleAction(item.enrollmentId, "drop")}>Drop</button>
                    </div></td>
                  </tr>;
                })}</tbody>
              </table>
            </div>
          )}
        </AdminCard>
        </>
      )}
    </div>
  );
}

export default AdminEnrollmentsPage;
