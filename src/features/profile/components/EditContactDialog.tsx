import type { Profile, UpdateProfileContactRequest } from "../types/Profile";
import ContactDialog from "./ContactDialog";

interface EditContactDialogProps {
  profile: Profile;
  onSave: (request: UpdateProfileContactRequest) => Promise<void>;
  onClose: () => void;
}

function EditContactDialog({ profile, onSave, onClose }: EditContactDialogProps) {
  return (
    <ContactDialog
      title="Edit Contact Information"
      description="Keep your email and phone number current."
      email={profile.email ?? ""}
      phoneNumber={profile.phoneNumber ?? ""}
      submitLabel="Save"
      required={false}
      onSave={onSave}
      onCancel={onClose}
    />
  );
}

export default EditContactDialog;
