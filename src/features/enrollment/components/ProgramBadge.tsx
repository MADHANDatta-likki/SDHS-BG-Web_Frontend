import type { ProgramType } from "../../../types/Enrollment";

interface ProgramBadgeProps {
  program: ProgramType;
}

const PROGRAM_LABELS: Record<ProgramType, string> = {
  MEMORIZATION: "Memorization",
  FLUENT: "Fluent Reading",
  REVISION: "Revision",
};

function ProgramBadge({ program }: ProgramBadgeProps) {
  return (
    <span
      className={`enrollment-badge enrollment-program enrollment-program--${program.toLowerCase()}`}
    >
      {PROGRAM_LABELS[program]}
    </span>
  );
}

export default ProgramBadge;
