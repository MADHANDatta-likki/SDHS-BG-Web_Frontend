import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { getApiErrorMessage } from "../../../utils/apiError";
import type { UpdateProfileContactRequest } from "../types/Profile";
import { contactSchema, type ContactFormValues } from "../utils/contactValidation";

interface ContactDialogProps {
  title: string;
  description: string;
  email: string;
  phoneNumber: string;
  submitLabel: string;
  required: boolean;
  onSave: (request: UpdateProfileContactRequest) => Promise<void>;
  onCancel?: () => void;
}

function ContactDialog({
  title,
  description,
  email,
  phoneNumber,
  submitLabel,
  required,
  onSave,
  onCancel,
}: ContactDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { email, phoneNumber },
  });

  useEffect(() => {
    reset({ email, phoneNumber });
    dialogRef.current?.focus();
  }, [email, phoneNumber, reset]);

  useEffect(() => {
    const keepFocusInside = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (!required) onCancel?.();
        return;
      }
      if (event.key !== "Tab" || dialogRef.current === null) return;
      const controls = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        "button:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex='-1'])",
      ));
      if (controls.length === 0) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", keepFocusInside);
    return () => document.removeEventListener("keydown", keepFocusInside);
  }, [onCancel, required]);

  const submit = async (values: ContactFormValues) => {
    setServerError("");
    try {
      await onSave({ email: values.email.trim(), phoneNumber: values.phoneNumber.trim() });
    } catch (error: unknown) {
      setServerError(getApiErrorMessage(error, "Unable to update contact information."));
    }
  };

  return (
    <div
      className="profile-dialog-backdrop"
      onMouseDown={(event) => {
        if (!required && event.target === event.currentTarget) onCancel?.();
      }}
    >
      <div
        ref={dialogRef}
        className="profile-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-dialog-title"
        aria-describedby="profile-dialog-description"
        tabIndex={-1}
      >
        <header className="profile-dialog__header">
          <div>
            <h2 id="profile-dialog-title">{title}</h2>
            <p id="profile-dialog-description">{description}</p>
          </div>
          {!required && (
            <button className="profile-dialog__close" type="button" onClick={onCancel} aria-label="Close contact information dialog">×</button>
          )}
        </header>
        <form className="profile-dialog__form" onSubmit={handleSubmit(submit)} noValidate>
          <div className="profile-dialog__body">
            {serverError && <div className="profile-alert profile-alert--error" role="alert">{serverError}</div>}
            <label className="profile-field" htmlFor="profile-email">
              <span>Email <span aria-hidden="true">*</span></span>
              <input
                id="profile-email"
                type="email"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "profile-email-error" : undefined}
                {...register("email")}
              />
              {errors.email && <small id="profile-email-error" role="alert">{errors.email.message}</small>}
            </label>
            <label className="profile-field" htmlFor="profile-phone">
              <span>Phone Number <span aria-hidden="true">*</span></span>
              <input
                id="profile-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                aria-invalid={Boolean(errors.phoneNumber)}
                aria-describedby={errors.phoneNumber ? "profile-phone-error" : undefined}
                {...register("phoneNumber")}
              />
              {errors.phoneNumber && <small id="profile-phone-error" role="alert">{errors.phoneNumber.message}</small>}
            </label>
          </div>
          <footer className="profile-dialog__footer">
            {!required && <button className="profile-button profile-button--secondary" type="button" disabled={isSubmitting} onClick={onCancel}>Cancel</button>}
            <button className="profile-button profile-button--primary" type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
              {isSubmitting ? "Saving..." : submitLabel}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

export default ContactDialog;
