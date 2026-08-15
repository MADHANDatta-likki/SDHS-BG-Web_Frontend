import { useEffect, useId, useRef, useState } from "react";

import adminService from "../services/AdminService";
import type { BulkBookingStudent } from "../types/api";

interface AdminStudentAutocompleteProps {
  selectedVolunteerId: string;
  onSelect: (student: BulkBookingStudent) => void;
}

function AdminStudentAutocomplete({
  selectedVolunteerId,
  onSelect,
}: AdminStudentAutocompleteProps) {
  const inputId = useId();
  const listboxId = useId();
  const requestSequence = useRef(0);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BulkBookingStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const normalizedQuery = query.trim();
    const sequence = requestSequence.current + 1;
    requestSequence.current = sequence;

    if (normalizedQuery.length < 2) {
      setResults([]);
      setLoading(false);
      setError("");
      return;
    }

    setLoading(true);
    setError("");
    const timeoutId = window.setTimeout(() => {
      void adminService.searchStudents(normalizedQuery)
        .then((students) => {
          if (requestSequence.current === sequence) {
            setResults(students);
          }
        })
        .catch(() => {
          if (requestSequence.current === sequence) {
            setResults([]);
            setError("Unable to search students.");
          }
        })
        .finally(() => {
          if (requestSequence.current === sequence) {
            setLoading(false);
          }
        });
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

  const choose = (student: BulkBookingStudent) => {
    onSelect(student);
    setQuery(`${student.name} (${student.volunteerId})`);
    setResults([]);
    setError("");
  };

  return (
    <div className="admin-field admin-student-search">
      <label htmlFor={inputId}>Student</label>
      <input
        id={inputId}
        type="search"
        role="combobox"
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-expanded={results.length > 0}
        aria-describedby={`${inputId}-help`}
        placeholder="Search by name or Volunteer ID"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          if (selectedVolunteerId) {
            onSelect({ volunteerId: "", name: "", groupId: null });
          }
        }}
      />
      <small id={`${inputId}-help`}>Enter at least 2 characters.</small>
      {loading && <small role="status">Searching students...</small>}
      {error && <small className="admin-field-error" role="alert">{error}</small>}
      {results.length > 0 && (
        <ul id={listboxId} className="admin-student-search__results" role="listbox">
          {results.map((student) => (
            <li key={student.volunteerId} role="option" aria-selected={student.volunteerId === selectedVolunteerId}>
              <button type="button" onClick={() => choose(student)}>
                <strong>{student.name}</strong>
                <span>{student.volunteerId}{student.groupId ? ` · ${student.groupId}` : ""}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AdminStudentAutocomplete;
