import { useCallback, useState } from "react";
import { formatChapterLabel } from "../../../utils/chapterLabel";
import AdminCard from "../components/AdminCard";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminState from "../components/AdminState";
import { getAdminApiError, useAdminResource } from "../hooks/useAdminResource";
import adminService from "../services/AdminService";
import type { SyllabusChapter } from "../types/api";
import "../styles/admin.css";

const sunday = () => {
  const date = new Date();
  date.setDate(date.getDate() + ((7 - date.getDay()) % 7));
  return date.toISOString().slice(0, 10);
};

const quickFiveSlokas = (totalSlokas: number): string => {
  const values: number[] = [];
  for (let sloka = 5; sloka < totalSlokas; sloka += 5) {
    values.push(sloka);
  }
  values.push(totalSlokas);
  return values.join(",");
};

function AdminSyllabusPage() {
  const [date, setDate] = useState(sunday());
  const load = useCallback(() => adminService.getSyllabus({ date }), [date]);
  const { data, setData, loading, error, reload } = useAdminResource(
    load,
    "Failed to load syllabus.",
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const update = (id: number, patch: Partial<SyllabusChapter>) => {
    setData((current) => current
      ? {
          ...current,
          chapters: current.chapters.map((chapter) =>
            chapter.id === id ? { ...chapter, ...patch } : chapter),
        }
      : current);
  };

  const save = async () => {
    if (!data) return;
    setSaving(true);
    setMessage("");
    setActionError("");
    try {
      const response = await adminService.saveSyllabus({
        date: data.date,
        entries: data.chapters
          .filter((chapter) => chapter.enabled)
          .map((chapter) => ({
            chapterId: chapter.id,
            allowedSlokas: chapter.allowedSlokas,
          })),
      });
      setMessage(response.message);
      await reload();
    } catch (saveError: unknown) {
      setActionError(getAdminApiError(saveError, "Failed to save syllabus."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Syllabus Config"
        description="Configure chapters and allowed slokas for a date."
      />
      <AdminCard title="Date">
        <label className="admin-field">
          Syllabus date
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </label>
      </AdminCard>
      {actionError && <div className="admin-alert admin-alert--error">{actionError}</div>}
      {message && <div className="admin-alert admin-alert--success">{message}</div>}
      {loading && <AdminState type="loading" message="Loading syllabus..." />}
      {!loading && error && (
        <AdminState type="error" message={error} onRetry={() => void reload()} />
      )}
      {!loading && data && (
        <AdminCard
          title="Chapters"
          label={`${data.chapters.filter((chapter) => chapter.enabled).length} selected`}
        >
          <div className="admin-list">
            {data.chapters.map((chapter) => (
              <div className="admin-list-row admin-syllabus-row" key={chapter.id}>
                <label className="admin-check">
                  <input
                    type="checkbox"
                    checked={chapter.enabled}
                    onChange={(event) =>
                      update(chapter.id, {
                        enabled: event.target.checked,
                        ...(!event.target.checked ? { allowedSlokas: "" } : {}),
                      })}
                  />
                  <span>
                    <strong>
                      {formatChapterLabel(
                        chapter.chapterNumber,
                        chapter.chapterName,
                        "Chapter",
                      )}
                    </strong>
                  </span>
                </label>
                <label className="admin-field">
                  Allowed slokas
                  <input
                    value={chapter.allowedSlokas}
                    disabled={!chapter.enabled}
                    onChange={(event) =>
                      update(chapter.id, { allowedSlokas: event.target.value })}
                    placeholder={`1-${chapter.totalSlokas}`}
                  />
                </label>
                <div className="admin-row-actions">
                  <button
                    className="admin-button admin-button--secondary"
                    type="button"
                    onClick={() =>
                      update(chapter.id, {
                        enabled: true,
                        allowedSlokas: quickFiveSlokas(chapter.totalSlokas),
                      })}
                  >
                    5s
                  </button>
                  <button
                    className="admin-link-button"
                    type="button"
                    onClick={() =>
                      update(chapter.id, { enabled: false, allowedSlokas: "" })}
                  >
                    Clear
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            className="admin-button admin-button--primary"
            type="button"
            disabled={saving}
            onClick={() => void save()}
          >
            {saving ? "Saving..." : "Save Syllabus"}
          </button>
        </AdminCard>
      )}
    </div>
  );
}

export default AdminSyllabusPage;
