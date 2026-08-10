import { useMemo, useState } from "react";

import {
  formatChapterLabel,
  isSupplementalChapter,
} from "../../../utils/chapterLabel";
import { generateSlokaOptions } from "../../../utils/slokaOptions";
import type {
  BookStudentSlotRequest,
  StudentChapter,
  StudentSlot,
} from "../types/api";

interface SlotBookingFormProps {
  chapters: StudentChapter[];
  slots: StudentSlot[];
  submitting: boolean;
  onSubmit: (request: BookStudentSlotRequest) => Promise<void>;
}

interface ChapterFieldsProps {
  chapters: StudentChapter[];
  chapterId: string;
  count: string;
  idSuffix: string;
  onChapterChange: (value: string) => void;
  onCountChange: (value: string) => void;
}

function ChapterFields({
  chapters,
  chapterId,
  count,
  idSuffix,
  onChapterChange,
  onCountChange,
}: ChapterFieldsProps) {
  const chapter = chapters.find((item) => item.id === Number(chapterId));
  const slokaOptions = generateSlokaOptions(chapter?.totalSlokas ?? 0);

  const handleChapterChange = (value: string) => {
    onChapterChange(value);
    onCountChange("");
  };

  return (
    <div className="student-form__chapter">
      <div className="student-field">
        <label htmlFor={`chapter${idSuffix}`}>Select {idSuffix ? "Second " : ""}Chapter</label>
        <select
          id={`chapter${idSuffix}`}
          value={chapterId}
          onChange={(event) => handleChapterChange(event.target.value)}
          required
        >
          <option value="">Select a chapter</option>
          {chapters.map((item) => (
            <option key={item.id} value={item.id}>
              {formatChapterLabel(item.chapterNumber, item.chapterName, "Ch")}
            </option>
          ))}
        </select>
      </div>
      <div className="student-field">
        <label htmlFor={`slokaCount${idSuffix}`}>
          Number of Slokas{idSuffix ? " (Chapter 2)" : ""}
        </label>
        <select
          id={`slokaCount${idSuffix}`}
          value={count}
          onChange={(event) => onCountChange(event.target.value)}
          disabled={chapter === undefined}
          required
        >
          <option value="">Select number of slokas</option>
          {slokaOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {chapter && (
          <small>
            {chapter.allowedSlokas
              ? `Allowed: ${chapter.allowedSlokas}`
              : `Chapter total: ${chapter.totalSlokas}`}
          </small>
        )}
      </div>
    </div>
  );
}

function SlotBookingForm({ chapters, slots, submitting, onSubmit }: SlotBookingFormProps) {
  const [slotId, setSlotId] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [slokaCount, setSlokaCount] = useState("");
  const [secondChapter, setSecondChapter] = useState(false);
  const [chapterId2, setChapterId2] = useState("");
  const [slokaCount2, setSlokaCount2] = useState("");
  const [validationError, setValidationError] = useState("");

  const selectedSlot = useMemo(
    () => slots.find((slot) => slot.id === Number(slotId)),
    [slotId, slots],
  );

  const validateCount = (selectedChapterId: string, value: string): string | null => {
    const chapter = chapters.find((item) => item.id === Number(selectedChapterId));
    const count = Number(value);
    if (!chapter || !Number.isInteger(count) || count <= 0) return "Please enter a valid sloka count.";
    if (chapter.allowedSlokas) {
      const allowed = chapter.allowedSlokas.split(",").map((item) => Number(item.trim()));
      if (!allowed.includes(count)) {
        const reference = isSupplementalChapter(chapter.chapterName)
          ? chapter.chapterName
          : `Chapter ${chapter.chapterNumber}`;
        return `Allowed sloka counts for ${reference}: ${chapter.allowedSlokas}.`;
      }
    } else if (count > chapter.totalSlokas) {
      const reference = isSupplementalChapter(chapter.chapterName)
        ? chapter.chapterName
        : `Chapter ${chapter.chapterNumber}`;
      return `Sloka count cannot exceed ${chapter.totalSlokas} for ${reference}.`;
    }
    return null;
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationError("");
    if (!slotId) return setValidationError("Please select a time slot.");
    if (!chapterId) return setValidationError("Please select a chapter.");
    const firstError = validateCount(chapterId, slokaCount);
    if (firstError) return setValidationError(firstError);
    if (secondChapter && !chapterId2) return setValidationError("Please select a second chapter or uncheck the option.");
    const secondError = secondChapter ? validateCount(chapterId2, slokaCount2) : null;
    if (secondError) return setValidationError(secondError);

    const request: BookStudentSlotRequest = {
      slotId: Number(slotId),
      chapterId: Number(chapterId),
      slokaCount: Number(slokaCount),
      ...(secondChapter
        ? { chapterId2: Number(chapterId2), slokaCount2: Number(slokaCount2) }
        : {}),
    };
    await onSubmit(request);
  };

  return (
    <form className="student-form" onSubmit={submit} noValidate>
      {validationError && <div className="student-alert student-alert--error" role="alert">{validationError}</div>}
      <section className="student-booking-step" aria-labelledby="booking-syllabus-step">
        <div className="student-booking-step__heading"><span aria-hidden="true">1</span><div><h3 id="booking-syllabus-step">Select Chapter</h3><p>Choose the syllabus you are ready to present.</p></div></div>
        <ChapterFields
          chapters={chapters}
          chapterId={chapterId}
          count={slokaCount}
          idSuffix=""
          onChapterChange={setChapterId}
          onCountChange={setSlokaCount}
        />
        <label className="student-checkbox">
          <input
            type="checkbox"
            checked={secondChapter}
            onChange={(event) => {
              setSecondChapter(event.target.checked);
              if (!event.target.checked) {
                setChapterId2("");
                setSlokaCount2("");
              }
            }}
          />
          Add second chapter
        </label>
        {secondChapter && (
          <ChapterFields
            chapters={chapters}
            chapterId={chapterId2}
            count={slokaCount2}
            idSuffix="2"
            onChapterChange={setChapterId2}
            onCountChange={setSlokaCount2}
          />
        )}
      </section>
      <section className="student-booking-step" aria-labelledby="booking-slot-step">
        <div className="student-booking-step__heading"><span aria-hidden="true">2</span><div><h3 id="booking-slot-step">Select Time Slot</h3><p>Choose one available examination window.</p></div></div>
        <fieldset className="student-slot-grid">
          <legend className="sr-only">Available examination time slots</legend>
          {slots.map((slot) => {
            const unavailable = slot.availableCount <= 0;
            return (
              <label
                key={slot.id}
                className={`student-slot${slot.id === selectedSlot?.id ? " student-slot--selected" : ""}${unavailable ? " student-slot--disabled" : ""}`}
              >
                <input
                  type="radio"
                  name="slot"
                  value={slot.id}
                  checked={slotId === String(slot.id)}
                  disabled={unavailable}
                  onChange={(event) => setSlotId(event.target.value)}
                />
                <strong>{slot.name}</strong>
                <span>{slot.duration}</span>
                <small>{unavailable ? "Full" : `${slot.availableCount} available`}</small>
              </label>
            );
          })}
        </fieldset>
      </section>
      <div className="student-booking-confirmation">
        <div><strong>Confirm Booking</strong><span>{selectedSlot ? selectedSlot.name : "Select a time slot to continue"}</span></div>
        <button className="student-button student-button--primary" type="submit" disabled={submitting}>
          {submitting && <span className="student-spinner student-spinner--small" aria-hidden="true" />}
          {submitting ? "Booking..." : "Confirm Booking"}
        </button>
      </div>
    </form>
  );
}

export default SlotBookingForm;
