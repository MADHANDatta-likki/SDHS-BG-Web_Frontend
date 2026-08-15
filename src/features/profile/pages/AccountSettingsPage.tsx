import { useState } from "react";

import DashboardPageHeader from "../../../components/common/DashboardPageHeader";
import { useAuth } from "../../auth/hooks/useAuth";
import ContactInfoCard from "../components/ContactInfoCard";
import EditContactDialog from "../components/EditContactDialog";
import type { UpdateProfileContactRequest } from "../types/Profile";
import "../styles/profile.css";

function AccountSettingsPage() {
  const { profile, updateProfileContact } = useAuth();
  const [editingContact, setEditingContact] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  if (profile === null) {
    return <div className="profile-state" role="status">Loading account settings...</div>;
  }

  const saveContact = async (request: UpdateProfileContactRequest) => {
    await updateProfileContact(request);
    setEditingContact(false);
    setSuccessMessage("Contact information updated successfully.");
  };

  return (
    <div className="profile-page">
      <DashboardPageHeader title="Account Settings" subtitle="Manage your personal account information and preferences." />
      {successMessage && <div className="profile-alert profile-alert--success" role="status">{successMessage}</div>}

      <section className="profile-card" aria-labelledby="personal-information-title">
        <header><div><h2 id="personal-information-title">Personal Information</h2><p>Information assigned to your SDHS volunteer account.</p></div></header>
        <dl className="profile-details profile-details--personal">
          <div><dt>Volunteer ID</dt><dd>{profile.volunteerId}</dd></div>
          <div><dt>Name</dt><dd>{profile.name}</dd></div>
          <div><dt>Role</dt><dd>{profile.role}</dd></div>
          {profile.trackType && <div><dt>Track</dt><dd>{profile.trackType}</dd></div>}
          {profile.groupId && <div><dt>Group</dt><dd>{profile.groupId}</dd></div>}
        </dl>
      </section>

      <ContactInfoCard profile={profile} onEdit={() => { setSuccessMessage(""); setEditingContact(true); }} />

      <section className="profile-card" aria-labelledby="password-settings-title">
        <header><div><h2 id="password-settings-title">Password</h2><p>Password changes continue through the existing secure password workflow.</p></div></header>
        <div className="profile-card__body"><span className="profile-placeholder">Password settings will be available from this account workspace.</span></div>
      </section>

      <div className="profile-future-grid">
        <section className="profile-card" aria-labelledby="notification-settings-title">
          <header><div><h2 id="notification-settings-title">Notifications</h2><p>Notification preferences will appear here.</p></div></header>
        </section>
        <section className="profile-card" aria-labelledby="privacy-settings-title">
          <header><div><h2 id="privacy-settings-title">Privacy</h2><p>Privacy preferences will appear here.</p></div></header>
        </section>
      </div>

      {editingContact && <EditContactDialog profile={profile} onSave={saveContact} onClose={() => setEditingContact(false)} />}
    </div>
  );
}

export default AccountSettingsPage;
