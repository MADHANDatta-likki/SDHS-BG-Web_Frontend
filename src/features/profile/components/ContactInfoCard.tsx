import type { Profile } from "../types/Profile";

interface ContactInfoCardProps {
  profile: Profile;
  onEdit: () => void;
}

function ContactInfoCard({ profile, onEdit }: ContactInfoCardProps) {
  return (
    <section className="profile-card" aria-labelledby="contact-information-title">
      <header><div><h2 id="contact-information-title">Contact Information</h2><p>How SDHS contacts you about learning activities.</p></div><button className="profile-button profile-button--secondary" type="button" onClick={onEdit}>Edit</button></header>
      <dl className="profile-details">
        <div><dt>Email</dt><dd>{profile.email}</dd></div>
        <div><dt>Phone Number</dt><dd>{profile.phoneNumber}</dd></div>
      </dl>
    </section>
  );
}

export default ContactInfoCard;
