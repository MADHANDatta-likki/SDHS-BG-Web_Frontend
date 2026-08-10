import { useCallback, useEffect, useState } from "react";

import { useAuth } from "../../auth/hooks/useAuth";
import DashboardPageHeader from "../../../components/common/DashboardPageHeader";
import AttendanceDayHeader from "../components/AttendanceDayHeader";
import AttendanceToggle from "../components/AttendanceToggle";
import TeacherCard from "../components/TeacherCard";
import TeacherState from "../components/TeacherState";
import { getTeacherApiError } from "../hooks/useTeacherResource";
import teacherService from "../services/TeacherService";
import type { SaveTeacherAttendanceRequest, TeacherAttendanceResponse } from "../types/api";
import "../styles/teacher.css";

function sunday(value: Date): string {
  const date = new Date(value);
  date.setDate(date.getDate() - date.getDay());
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function shiftWeek(value: string, days: number): string {
  const date = new Date(`${value}T00:00:00`);
  date.setDate(date.getDate() + days);
  return sunday(date);
}

function TeacherAttendancePage() {
  const { currentUser } = useAuth();
  const [groupInput, setGroupInput] = useState(currentUser?.groupId ?? "");
  const [groupId, setGroupId] = useState(currentUser?.groupId ?? "");
  const [weekStart, setWeekStart] = useState(sunday(new Date()));
  const [data, setData] = useState<TeacherAttendanceResponse | null>(null);
  const [present, setPresent] = useState<Record<string, boolean>>({});
  const [noClass, setNoClass] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  const load = useCallback(async (selectedGroup: string, selectedWeek: string) => {
    setLoading(true);
    setAlert(null);
    try {
      const response = await teacherService.getAttendance({
        ...(selectedGroup ? { groupId: selectedGroup } : {}),
        weekStart: selectedWeek,
      });
      setData(response);
      setPresent(response.presentMap);
      setNoClass(response.noClassMap);
      if (selectedGroup && response.students.length === 0) {
        setAlert({ type: "info", message: "No students found for this group/week." });
      }
    } catch (loadError: unknown) {
      setData(null);
      setAlert({ type: "error", message: getTeacherApiError(loadError, "Failed to load attendance data.") });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => void load(groupId, weekStart), [groupId, load, weekStart]);

  const changeWeek = (days: number) => setWeekStart((current) => shiftWeek(current, days));
  const disabledDate = (date: string) =>
    !data || date > data.today ||
    Boolean(data.groupStartDate && date < data.groupStartDate) ||
    Boolean(data.groupEndDate && date > data.groupEndDate);

  const toggleNoClass = (date: string) => {
    const markedNoClass = !noClass[date];
    setNoClass((current) => ({ ...current, [date]: markedNoClass }));

    if (markedNoClass) {
      setPresent((current) =>
        Object.fromEntries(
          Object.entries(current).filter(([key]) => !key.startsWith(`${date}|`)),
        ),
      );
    }
  };

  const markAll = (date: string, markedPresent: boolean) => {
    if (!data || disabledDate(date) || noClass[date]) {
      return;
    }

    setPresent((current) => {
      const updated = { ...current };
      data.students.forEach((student) => {
        updated[`${date}|${student.volunteerId}`] = markedPresent;
      });
      return updated;
    });
  };

  const attendanceSummary = (date: string) => {
    if (!data || noClass[date]) {
      return { presentCount: 0, absentCount: 0 };
    }

    const presentCount = data.students.reduce(
      (count, student) =>
        count + (present[`${date}|${student.volunteerId}`] ? 1 : 0),
      0,
    );

    return {
      presentCount,
      absentCount: data.students.length - presentCount,
    };
  };
  const todaySummary = data ? attendanceSummary(data.today) : { presentCount: 0, absentCount: 0 };
  const todayInSelectedWeek = data?.weekDates.includes(data.today) ?? false;
  const markedPresent = data?.weekDates.reduce((total, date) => total + attendanceSummary(date).presentCount, 0) ?? 0;

  const save = async () => {
    if (!data || !groupId) return;
    const request: SaveTeacherAttendanceRequest = { groupId, weekStart: data.weekStart };
    Object.entries(noClass).forEach(([date, marked]) => {
      if (marked) request[`nc_${date}`] = "1";
    });
    Object.entries(present).forEach(([key, marked]) => {
      if (!marked) return;
      const [date, volunteerId] = key.split("|");
      if (date && volunteerId) request[`p_${date}_${volunteerId}`] = "1";
    });
    setSaving(true);
    setAlert(null);
    try {
      const response = await teacherService.saveAttendance(request);
      setAlert({ type: "success", message: response.message });
      await load(groupId, weekStart);
    } catch (saveError: unknown) {
      setAlert({ type: "error", message: getTeacherApiError(saveError, "Failed to save attendance.") });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="teacher-page">
      <DashboardPageHeader title="Teacher Attendance" subtitle="Select a group and week to review and record student attendance." />
      {alert && <div className={`teacher-alert teacher-alert--${alert.type}`} role={alert.type === "error" ? "alert" : "status"}>{alert.message}</div>}
      <TeacherCard title="Select Group">
        <form className="teacher-group-form" onSubmit={(event) => {
          event.preventDefault();
          const value = groupInput.trim();
          if (!value) return setAlert({ type: "error", message: "Please enter a Group ID." });
          setGroupId(value);
          if (value === groupId) void load(value, weekStart);
        }}>
          <label htmlFor="teacher-group">Group ID</label>
          <input id="teacher-group" list="teacher-groups" value={groupInput} onChange={(event) => setGroupInput(event.target.value)} placeholder="Enter Group ID" autoCapitalize="characters" />
          <datalist id="teacher-groups">{data?.groups.map((group) => <option key={group} value={group} />)}</datalist>
          <button className="teacher-button teacher-button--primary" type="submit" disabled={loading}>Load</button>
        </form>
        {data && data.groups.length > 0 && (
          <div className="teacher-group-chips" aria-label="Available groups">
            <span>Available groups:</span>
            {data.groups.map((group) => <button key={group} type="button" aria-pressed={group === groupId} onClick={() => { setGroupInput(group); setGroupId(group); }}>{group}</button>)}
          </div>
        )}
      </TeacherCard>
      <TeacherCard title="Week" label={groupId || "No Group"}>
        <div className="teacher-week">
          <button className="teacher-button teacher-button--secondary" type="button" disabled={loading} onClick={() => changeWeek(-7)}>← Prev Week</button>
          <strong>{data ? `${data.weekStart} – ${data.weekEnd}` : weekStart}</strong>
          <button className="teacher-button teacher-button--secondary" type="button" disabled={loading} onClick={() => changeWeek(7)}>Next Week →</button>
        </div>
      </TeacherCard>
      {loading && <TeacherState type="loading" message="Loading attendance data..." />}
      {!loading && data && data.students.length > 0 && (
        <section className="teacher-operations-section" aria-labelledby="attendance-summary-title">
          <div className="teacher-section-heading"><div><h2 id="attendance-summary-title">Attendance Summary</h2><p>Current status for the selected group and week.</p></div></div>
          <div className="teacher-stats teacher-stats--compact">
            <div><strong>{data.students.length}</strong><span>Students</span></div>
            <div><strong>{todayInSelectedWeek ? todaySummary.presentCount : "—"}</strong><span>Present Today</span></div>
            <div><strong>{markedPresent}</strong><span>Present Marks This Week</span></div>
          </div>
        </section>
      )}
      {!loading && groupId && data && data.students.length === 0 && <TeacherState type="empty" message="No students found for this group and week." />}
      {!loading && data && data.students.length > 0 && (
        <TeacherCard title="Attendance Grid" label={`${data.students.length} students`}>
          <div className="teacher-table-wrap">
            <table className="teacher-attendance-table">
              <caption className="sr-only">Attendance for {groupId} from {data.weekStart} through {data.weekEnd}</caption>
              <thead>
                <tr>
                  <th scope="col">Student</th>
                  {data.weekDates.map((date) => {
                    const summary = attendanceSummary(date);
                    return (
                      <th key={date} scope="col">
                        <AttendanceDayHeader
                          date={date}
                          dateLabel={data.dateLabels[date] ?? date}
                          noClass={Boolean(noClass[date])}
                          disabled={disabledDate(date)}
                          presentCount={summary.presentCount}
                          absentCount={summary.absentCount}
                          onNoClassChange={() => toggleNoClass(date)}
                          onMarkAllPresent={() => markAll(date, true)}
                          onMarkAllAbsent={() => markAll(date, false)}
                        />
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {data.students.map((student) => (
                  <tr key={student.volunteerId}>
                    <th scope="row"><strong>{student.name}</strong><span>{student.volunteerId}</span></th>
                    {data.weekDates.map((date) => {
                      const key = `${date}|${student.volunteerId}`;
                      const disabled = disabledDate(date) || Boolean(noClass[date]);
                      return (
                        <td key={key}>
                          <AttendanceToggle
                            present={Boolean(present[key])}
                            disabled={disabled}
                            studentName={student.name}
                            dateLabel={data.dateLabels[date] ?? date}
                            onChange={(markedPresent) =>
                              setPresent((current) => ({
                                ...current,
                                [key]: markedPresent,
                              }))
                            }
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="teacher-save-row">
            <span>Future dates and dates outside the active group period are locked.</span>
            <button className="teacher-button teacher-button--primary" type="button" disabled={saving} onClick={() => void save()}>{saving ? "Saving..." : "Save Attendance"}</button>
          </div>
        </TeacherCard>
      )}
    </div>
  );
}

export default TeacherAttendancePage;
