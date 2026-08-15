import { useAuth } from "../../auth/hooks/useAuth";
import type { UpdateProfileContactRequest } from "../types/Profile";
import ContactDialog from "./ContactDialog";

function CompleteProfileDialog() {
  const { profile, updateProfileContact } = useAuth();
  if (profile === null || !profile.profileCompletionRequired) return null;

  const save = async (request: UpdateProfileContactRequest) => {
    await updateProfileContact(request);
  };

  return (
    <ContactDialog
      title="Welcome to SDHS Learning Portal"
      description="Please complete your contact information so teachers and administrators can reach you regarding classes, attendance, exams, and important announcements."
      email={profile.email ?? ""}
      phoneNumber={profile.phoneNumber ?? ""}
      submitLabel="Save & Continue"
      required
      onSave={save}
    />
  );
}

export default CompleteProfileDialog;
