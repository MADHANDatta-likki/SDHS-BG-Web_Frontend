import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { ROUTES } from "../../../constants/RouteConstants";
import { useAuth } from "../../auth/hooks/useAuth";
import AdminBadge from "../components/AdminBadge";
import AdminCard from "../components/AdminCard";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminState from "../components/AdminState";
import AdminVolunteerModal, { type VolunteerAction, type VolunteerEditErrors } from "../components/AdminVolunteerModal";
import { getAdminApiError, useAdminResource } from "../hooks/useAdminResource";
import adminService from "../services/AdminService";
import type { AdminVolunteer, EditVolunteerRequest, VolunteerQuery } from "../types/api";
import { volunteerStatusTone } from "../utils/volunteerPresentation";
import "../styles/admin.css";

type SortColumn = "name" | "volunteerId" | "status" | "enrollmentType";
type SortDirection = "asc" | "desc";

const DEFAULT_PAGE_SIZE = 25;
const PAGE_SIZES = [10, 25, 50, 100] as const;

const TYPE_LABELS: Record<string, string> = {
  S: "Student",
  T: "Teacher",
  A: "Admin",
};

function typeTone(type: string | null): "student" | "teacher" | "admin" {
  const normalized = type?.toUpperCase();
  if (normalized === "T") return "teacher";
  if (normalized === "A") return "admin";
  return "student";
}

function GroupDisplay({ volunteer }: { volunteer: AdminVolunteer }) {
  const group = volunteer.groupName ?? volunteer.groupId;
  if (!group) return <>-</>;

  const timedGroup = group.match(/^(.*?)\s*\(([^)]*(?:AM|PM)[^)]*)\)\s*$/i);
  if (!timedGroup) return <span className="admin-volunteer-group">{group}</span>;

  return (
    <span className="admin-volunteer-group">
      <span>{timedGroup[1].trim()}</span>
      <small>{timedGroup[2].trim()}</small>
    </span>
  );
}

function ContactDisplay({ volunteer }: { volunteer: AdminVolunteer }) {
  if (!volunteer.phoneNumber && !volunteer.email) return <>-</>;
  return (
    <span className="admin-volunteer-contact">
      {volunteer.phoneNumber && <span>📞 {volunteer.phoneNumber}</span>}
      {volunteer.email && <span>✉ {volunteer.email}</span>}
    </span>
  );
}

function SortHeader({
  column,
  label,
  sortColumn,
  sortDirection,
  onSort,
}: {
  column: SortColumn;
  label: string;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  onSort: (column: SortColumn) => void;
}) {
  const active = sortColumn === column;
  return (
    <th aria-sort={active ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}>
      <button className="admin-sort-button" type="button" onClick={() => onSort(column)}>
        {label}<span aria-hidden="true">{active ? (sortDirection === "asc" ? "▲" : "▼") : "↕"}</span>
      </button>
    </th>
  );
}

function AdminVolunteersPage() {
  const { currentUser } = useAuth();
  const [query, setQuery] = useState<VolunteerQuery>({});
  const [applied, setApplied] = useState<VolunteerQuery>({});
  const load = useCallback(() => adminService.getVolunteers(applied), [applied]);
  const { data, loading, error, reload } = useAdminResource(load, "Failed to load volunteers.");
  const [selected, setSelected] = useState<AdminVolunteer | null>(null);
  const [edit, setEdit] = useState<EditVolunteerRequest>({});
  const [reason, setReason] = useState("");
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [modalError, setModalError] = useState("");
  const [processingAction, setProcessingAction] = useState<VolunteerAction | null>(null);
  const [exporting, setExporting] = useState(false);
  const [sortColumn, setSortColumn] = useState<SortColumn>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [currentPage, setCurrentPage] = useState(1);
  const manageButtonRef = useRef<HTMLButtonElement | null>(null);
  const returnFocusVolunteerIdRef = useRef("");
  const requestInFlightRef = useRef(false);

  const volunteers = data?.volunteers ?? [];
  const summary = useMemo(() => ({
    total: volunteers.length,
    students: volunteers.filter((volunteer) => volunteer.enrollmentType?.toUpperCase() === "S").length,
    teachers: volunteers.filter((volunteer) => volunteer.enrollmentType?.toUpperCase() === "T").length,
    admins: volunteers.filter((volunteer) => volunteer.enrollmentType?.toUpperCase() === "A").length,
    active: volunteers.filter((volunteer) => volunteer.status.toUpperCase() === "ACTIVE").length,
    inactive: volunteers.filter((volunteer) => volunteer.status.toUpperCase() === "INACTIVE").length,
    dropped: volunteers.filter((volunteer) => volunteer.status.toUpperCase() === "DROPPED").length,
  }), [volunteers]);

  const sortedVolunteers = useMemo(() => [...volunteers].sort((left, right) => {
    const leftValue = String(left[sortColumn] ?? "");
    const rightValue = String(right[sortColumn] ?? "");
    const comparison = leftValue.localeCompare(rightValue, undefined, { numeric: true, sensitivity: "base" });
    return sortDirection === "asc" ? comparison : -comparison;
  }), [volunteers, sortColumn, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sortedVolunteers.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const visibleVolunteers = sortedVolunteers.slice(pageStart, pageStart + pageSize);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const editErrors = useMemo<VolunteerEditErrors>(() => {
    const errors: VolunteerEditErrors = {};
    if (!edit.name?.trim()) errors.name = "Name is required.";
    const email = edit.email?.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";
    const phone = edit.phoneNumber?.trim();
    if (phone && !/^[0-9+().\-\s]{7,25}$/.test(phone)) errors.phoneNumber = "Enter a valid phone number.";
    return errors;
  }, [edit.email, edit.name, edit.phoneNumber]);

  const closeModal = useCallback(() => {
    const trigger = manageButtonRef.current;
    const volunteerId = returnFocusVolunteerIdRef.current;
    setSelected(null);
    setModalError("");
    window.requestAnimationFrame(() => {
      if (trigger?.isConnected) {
        trigger.focus();
        return;
      }
      const replacement = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-manage-volunteer-id]"))
        .find((button) => button.dataset.manageVolunteerId === volunteerId);
      replacement?.focus();
    });
  }, []);

  const choose = (volunteer: AdminVolunteer, trigger: HTMLButtonElement) => {
    manageButtonRef.current = trigger;
    returnFocusVolunteerIdRef.current = volunteer.volunteerId;
    setSelected(volunteer);
    setReason("");
    setModalError("");
    setEdit({
      name: volunteer.name,
      phoneNumber: volunteer.phoneNumber ?? "",
      email: volunteer.email,
      groupId: volunteer.groupId ?? "",
      trackType: volunteer.trackType ?? "",
      enrollmentType: volunteer.enrollmentType ?? "",
      slotEligible: volunteer.slotEligible ?? false,
    });
  };

  const act = async (type: VolunteerAction) => {
    if (!selected || requestInFlightRef.current) return;
    if (type === "edit" && Object.keys(editErrors).length > 0) return;
    const isCurrentAdministrator = selected.volunteerId.toLowerCase() === currentUser?.volunteerId?.toLowerCase();
    if (type === "drop" && isCurrentAdministrator) {
      setModalError("You cannot perform this action on your own administrator account.");
      return;
    }
    requestInFlightRef.current = true;
    setProcessingAction(type);
    setNotice(null);
    setModalError("");
    try {
      await (type === "edit"
        ? adminService.editVolunteer(selected.volunteerId, edit)
        : type === "drop"
          ? adminService.dropVolunteer(selected.volunteerId, { reason })
          : adminService.reactivateVolunteer(selected.volunteerId));
      const successMessage = type === "edit"
        ? "Volunteer updated successfully."
        : type === "drop"
          ? "Volunteer dropped successfully."
          : "Volunteer reactivated successfully.";
      setNotice({ type: "success", text: successMessage });
      await reload();
      closeModal();
    } catch (actionError: unknown) {
      const fallbackMessage = type === "edit"
        ? "Unable to update volunteer."
        : type === "drop"
          ? "Unable to drop volunteer."
          : "Unable to reactivate volunteer.";
      setModalError(getAdminApiError(actionError, fallbackMessage));
    } finally {
      requestInFlightRef.current = false;
      setProcessingAction(null);
    }
  };

  const search = () => {
    setCurrentPage(1);
    setApplied(query);
  };

  const exportCsv = async () => {
    if (exporting) return;
    setExporting(true);
    setNotice(null);
    try {
      const download = await adminService.exportVolunteers(applied);
      const url = URL.createObjectURL(download.content);
      const link = document.createElement("a");
      link.href = url;
      link.download = download.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (exportError: unknown) {
      setNotice({
        type: "error",
        text: getAdminApiError(exportError, "Unable to export volunteers."),
      });
    } finally {
      setExporting(false);
    }
  };

  const reset = () => {
    setQuery({});
    setApplied({});
    setCurrentPage(1);
    setPageSize(DEFAULT_PAGE_SIZE);
    setSortColumn("name");
    setSortDirection("asc");
  };

  const sort = (column: SortColumn) => {
    setCurrentPage(1);
    if (sortColumn === column) {
      setSortDirection((direction) => direction === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  return (
    <div className="admin-page">
      <AdminPageHeader title="Manage Volunteers" description="Review volunteer status, find records, and manage individual accounts." />
      {notice && <div className={`admin-alert admin-alert--${notice.type}`}>{notice.text}</div>}

      {!loading && data && (
        <section className="admin-operations-section" aria-labelledby="volunteer-summary-title">
          <div className="admin-section-heading"><div><h2 id="volunteer-summary-title">Volunteer Summary</h2><p>A current view of the loaded volunteer population.</p></div></div>
          <div className="admin-stats admin-volunteer-stats" aria-label="Volunteer summary">
          <div><strong>{summary.total}</strong><span>Total Volunteers</span></div>
          <div><strong>{summary.students}</strong><span>Students</span></div>
          <div><strong>{summary.teachers}</strong><span>Teachers</span></div>
          <div><strong>{summary.admins}</strong><span>Admins</span></div>
          <div><strong>{summary.active}</strong><span>Active</span></div>
          <div><strong>{summary.inactive}</strong><span>Inactive</span></div>
          <div><strong>{summary.dropped}</strong><span>Dropped</span></div>
          </div>
        </section>
      )}

      <AdminCard title="Search & Filters">
        <form className="admin-filter-grid admin-volunteer-filters" onSubmit={(event) => { event.preventDefault(); search(); }}>
          <label className="admin-field">Search<input value={query.q ?? ""} onChange={(event) => setQuery({ ...query, q: event.target.value })} placeholder="Name or Volunteer ID" /></label>
          <label className="admin-field">Status<select value={query.status ?? ""} onChange={(event) => setQuery({ ...query, status: event.target.value })}><option value="">All</option><option>ACTIVE</option><option>DROPPED</option><option>INACTIVE</option></select></label>
          <label className="admin-field">Type<select value={query.enrollmentType ?? ""} onChange={(event) => setQuery({ ...query, enrollmentType: event.target.value })}><option value="">All</option><option value="S">Student</option><option value="T">Teacher</option><option value="A">Admin</option></select></label>
          <label className="admin-field">Track<select value={query.trackType ?? ""} onChange={(event) => setQuery({ ...query, trackType: event.target.value })}><option value="">All</option><option>MEM</option><option>FLUENT</option></select></label>
          <label className="admin-field">Group<input value={query.groupId ?? ""} onChange={(event) => setQuery({ ...query, groupId: event.target.value })} /></label>
          <div className="admin-row-actions admin-volunteer-filter-actions">
            <button className="admin-button admin-button--primary" type="submit">Search</button>
            <button className="admin-button admin-button--secondary" type="button" onClick={reset}>Reset</button>
            <button className="admin-button admin-button--secondary" type="button" disabled={exporting} onClick={() => void exportCsv()}>{exporting ? "Exporting..." : "Export CSV"}</button>
          </div>
        </form>
      </AdminCard>

      {loading && <AdminState type="loading" message="Loading volunteers..." />}
      {!loading && error && <AdminState type="error" message={error} onRetry={() => void reload()} />}
      {!loading && data && (
        <AdminCard title="Volunteer List" label={`${data.total} Volunteers`}>
          {volunteers.length === 0 ? (
            <AdminState type="empty" message="No volunteers match the selected filters." />
          ) : (
            <>
              <div className="admin-table-wrap">
                <table className="admin-table admin-volunteer-table">
                  <caption className="sr-only">Volunteers matching the active search and filters</caption>
                  <thead>
                    <tr>
                      <SortHeader column="name" label="Volunteer Name" sortColumn={sortColumn} sortDirection={sortDirection} onSort={sort} />
                      <SortHeader column="volunteerId" label="Volunteer ID" sortColumn={sortColumn} sortDirection={sortDirection} onSort={sort} />
                      <th>Group</th>
                      <SortHeader column="enrollmentType" label="Type" sortColumn={sortColumn} sortDirection={sortDirection} onSort={sort} />
                      <SortHeader column="status" label="Status" sortColumn={sortColumn} sortDirection={sortDirection} onSort={sort} />
                      <th>Contact</th>
                      <th className="admin-volunteer-actions-column">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleVolunteers.map((volunteer) => (
                      <tr key={volunteer.volunteerId}>
                        <td>{volunteer.name}</td>
                        <td>{volunteer.volunteerId}</td>
                        <td><GroupDisplay volunteer={volunteer} /></td>
                        <td><AdminBadge tone={typeTone(volunteer.enrollmentType)}>{TYPE_LABELS[volunteer.enrollmentType?.toUpperCase() ?? ""] ?? volunteer.enrollmentType ?? "-"}</AdminBadge></td>
                        <td><AdminBadge tone={volunteerStatusTone(volunteer.status)}>{volunteer.status}</AdminBadge></td>
                        <td><ContactDisplay volunteer={volunteer} /></td>
                        <td className="admin-volunteer-actions-column"><div className="admin-row-actions"><button className="admin-link-button" type="button" data-manage-volunteer-id={volunteer.volunteerId} onClick={(event) => choose(volunteer, event.currentTarget)}>Manage</button><Link to={`${ROUTES.ADMIN.VOLUNTEERS}/${encodeURIComponent(volunteer.volunteerId)}/analytics`}>Analytics</Link></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="admin-pagination" aria-label="Volunteer pagination">
                <label className="admin-field">Rows per page<select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setCurrentPage(1); }}>{PAGE_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}</select></label>
                <span>Page {safePage} of {totalPages}</span>
                <div className="admin-row-actions">
                  <button className="admin-button admin-button--secondary" type="button" disabled={safePage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>Previous</button>
                  <button className="admin-button admin-button--secondary" type="button" disabled={safePage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}>Next</button>
                </div>
              </div>
            </>
          )}
        </AdminCard>
      )}

      {selected && <AdminVolunteerModal volunteer={selected} edit={edit} reason={reason} errors={editErrors} errorMessage={modalError} processingAction={processingAction} currentAdministrator={selected.volunteerId.toLowerCase() === currentUser?.volunteerId?.toLowerCase()} onEditChange={setEdit} onReasonChange={setReason} onSave={() => void act("edit")} onDrop={() => void act("drop")} onReactivate={() => void act("reactivate")} onClose={closeModal} />}
    </div>
  );
}

export default AdminVolunteersPage;
