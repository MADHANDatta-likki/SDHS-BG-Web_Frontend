import { useEffect, useRef, useState } from "react";

import type { AdminVolunteer, EditVolunteerRequest } from "../types/api";
import { volunteerStatusTone } from "../utils/volunteerPresentation";
import AdminBadge from "./AdminBadge";

export interface VolunteerEditErrors {
  name?: string;
  email?: string;
  phoneNumber?: string;
}

export type VolunteerAction = "edit" | "drop" | "reactivate";

interface AdminVolunteerModalProps {
  volunteer: AdminVolunteer;
  edit: EditVolunteerRequest;
  reason: string;
  errors: VolunteerEditErrors;
  errorMessage: string;
  processingAction: VolunteerAction | null;
  currentAdministrator: boolean;
  onEditChange: (edit: EditVolunteerRequest) => void;
  onReasonChange: (reason: string) => void;
  onSave: () => void;
  onDrop: () => void;
  onReactivate: () => void;
  onClose: () => void;
}

const FOCUSABLE_SELECTOR = [
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "a[href]",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function AdminVolunteerModal({
  volunteer,
  edit,
  reason,
  errors,
  errorMessage,
  processingAction,
  currentAdministrator,
  onEditChange,
  onReasonChange,
  onSave,
  onDrop,
  onReactivate,
  onClose,
}: AdminVolunteerModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const confirmationCancelRef = useRef<HTMLButtonElement>(null);
  const [confirmation, setConfirmation] = useState<"drop" | "reactivate" | null>(null);
  const valid = Object.keys(errors).length === 0;
  const working = processingAction !== null;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);

  useEffect(() => {
    if (confirmation) confirmationCancelRef.current?.focus();
    else nameRef.current?.focus();
  }, [confirmation]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (confirmation) setConfirmation(null);
        else onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!dialogRef.current.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [confirmation, onClose]);

  const dismiss = () => {
    if (confirmation) setConfirmation(null);
    else onClose();
  };

  const confirmingDrop = confirmation === "drop";
  const confirmationTitle = confirmingDrop ? "Drop Volunteer?" : "Reactivate Volunteer?";

  return (
    <div className="admin-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) dismiss(); }}>
      <div ref={dialogRef} className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="manage-volunteer-title" aria-describedby={confirmation ? "manage-volunteer-confirmation-description" : undefined} tabIndex={-1}>
        <header className="admin-modal__header">
          <div>
            <span>{confirmation ? "Confirm Action" : "Manage Volunteer"}</span>
            <h2 id="manage-volunteer-title">{confirmation ? confirmationTitle : volunteer.name}</h2>
          </div>
          <button className="admin-modal__close" type="button" onClick={dismiss} aria-label={confirmation ? "Cancel confirmation" : "Close manage volunteer dialog"}>×</button>
        </header>

        {confirmation ? (
          <div className="admin-modal__form">
            <div className="admin-modal__body admin-confirmation" id="manage-volunteer-confirmation-description">
              {errorMessage && <div className="admin-alert admin-alert--error" role="alert">{errorMessage}</div>}
              <p>{confirmingDrop ? "The volunteer will immediately lose access to the system." : "The volunteer will regain access to the system."}</p>
              {confirmingDrop && <p>This action can be reversed later by Reactivate.</p>}
            </div>
            <footer className="admin-modal__footer">
              <button ref={confirmationCancelRef} className="admin-button admin-button--secondary" type="button" disabled={working} onClick={() => setConfirmation(null)}>Cancel</button>
              <button className={`admin-button ${confirmingDrop ? "admin-button--danger" : "admin-button--primary"}`} type="button" disabled={working} onClick={confirmingDrop ? onDrop : onReactivate}>{processingAction ? "Processing..." : confirmingDrop ? "Drop" : "Reactivate"}</button>
            </footer>
          </div>
        ) : (
          <form className="admin-modal__form" onSubmit={(event) => { event.preventDefault(); if (valid && !working) onSave(); }} noValidate>
            <div className="admin-modal__body">
              {errorMessage && <div className="admin-alert admin-alert--error" role="alert">{errorMessage}</div>}

              <section className="admin-modal__section" aria-labelledby="volunteer-information-heading">
                <h3 id="volunteer-information-heading">Volunteer Information</h3>
                <div className="admin-form-grid admin-volunteer-modal-grid">
                  <label className="admin-field">Volunteer ID<input value={volunteer.volunteerId} readOnly aria-readonly="true" /></label>
                  <div className="admin-field admin-modal__status"><span>Status</span><AdminBadge tone={volunteerStatusTone(volunteer.status)}>{volunteer.status}</AdminBadge></div>
                  <label className="admin-field">Name<input ref={nameRef} value={edit.name ?? ""} onChange={(event) => onEditChange({ ...edit, name: event.target.value })} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "volunteer-name-error" : undefined} />{errors.name && <small className="admin-field-error" id="volunteer-name-error">{errors.name}</small>}</label>
                  <label className="admin-field">Phone<input type="tel" value={edit.phoneNumber ?? ""} onChange={(event) => onEditChange({ ...edit, phoneNumber: event.target.value })} aria-invalid={Boolean(errors.phoneNumber)} aria-describedby={errors.phoneNumber ? "volunteer-phone-error" : undefined} />{errors.phoneNumber && <small className="admin-field-error" id="volunteer-phone-error">{errors.phoneNumber}</small>}</label>
                  <label className="admin-field">Email<input type="email" value={edit.email ?? ""} onChange={(event) => onEditChange({ ...edit, email: event.target.value })} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "volunteer-email-error" : undefined} />{errors.email && <small className="admin-field-error" id="volunteer-email-error">{errors.email}</small>}</label>
                  <label className="admin-field">Group<input value={edit.groupId ?? ""} onChange={(event) => onEditChange({ ...edit, groupId: event.target.value })} /></label>
                  <label className="admin-field">Enrollment Type<select value={edit.enrollmentType ?? ""} onChange={(event) => onEditChange({ ...edit, enrollmentType: event.target.value })}><option value="S">Student</option><option value="T">Teacher</option><option value="A">Admin</option></select></label>
                  <label className="admin-field">Track Type<select value={edit.trackType ?? ""} onChange={(event) => onEditChange({ ...edit, trackType: event.target.value })}><option value="">None</option><option value="MEM">MEM</option><option value="FLUENT">FLUENT</option></select></label>
                  <label className="admin-check admin-modal__check"><input type="checkbox" checked={Boolean(edit.slotEligible)} onChange={(event) => onEditChange({ ...edit, slotEligible: event.target.checked })} />Slot Eligible</label>
                </div>
              </section>

              <section className="admin-modal__section admin-modal__danger-zone" aria-labelledby="volunteer-actions-heading">
                <h3 id="volunteer-actions-heading">Actions</h3>
                {currentAdministrator && <div className="admin-alert admin-alert--info" role="status">You cannot perform this action on your own administrator account.</div>}
                {volunteer.status === "ACTIVE" ? (
                  <>
                    <label className="admin-field">Drop reason<input value={reason} onChange={(event) => onReasonChange(event.target.value)} /></label>
                    <button className="admin-button admin-button--danger" type="button" disabled={working || currentAdministrator} onClick={() => setConfirmation("drop")}>Drop Volunteer</button>
                  </>
                ) : (
                  <button className="admin-button admin-button--primary" type="button" disabled={working || currentAdministrator} onClick={() => setConfirmation("reactivate")}>Reactivate Volunteer</button>
                )}
              </section>
            </div>

            <footer className="admin-modal__footer">
              <button className="admin-button admin-button--secondary" type="button" disabled={working} onClick={onClose}>Cancel</button>
              <button className="admin-button admin-button--primary" type="submit" disabled={working || !valid}>{processingAction === "edit" ? "Saving..." : "Save Changes"}</button>
            </footer>
          </form>
        )}
      </div>
    </div>
  );
}

export default AdminVolunteerModal;
