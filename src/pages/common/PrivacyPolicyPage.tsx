import { Link } from "react-router-dom";

import logo from "../../assets/images/logo.png";
import { ROUTES } from "../../constants/RouteConstants";
import { effectiveDate, lastUpdated, version } from "../../constants/legal";
import "./privacy-policy.css";

const sections = [
  ["introduction", "Introduction"],
  ["information-we-collect", "Information We Collect"],
  ["information-we-do-not-collect", "Information We Do Not Collect"],
  ["how-we-use-information", "How We Use Information"],
  ["data-sharing", "Data Sharing"],
  ["security", "Security"],
  ["data-retention", "Data Retention"],
  ["childrens-privacy", "Children’s Privacy"],
  ["third-party-services", "Third-Party Services"],
  ["user-rights", "User Rights"],
  ["policy-updates", "Policy Updates"],
  ["contact", "Contact"],
] as const;

function PrivacyPolicyPage() {
  return (
    <div className="privacy-page">
      <header className="privacy-header">
        <Link className="privacy-brand" to={ROUTES.HOME} aria-label="SDHS Learning Portal home">
          <img src={logo} alt="" />
          <span>SDHS Learning Portal</span>
        </Link>
        <Link className="privacy-header__link" to={ROUTES.LOGIN}>Sign In</Link>
      </header>

      <main className="privacy-main" id="main-content">
        <section className="privacy-hero" aria-labelledby="privacy-title">
          <p className="privacy-eyebrow">Legal &amp; Privacy</p>
          <h1 id="privacy-title">Privacy Policy</h1>
          <dl className="privacy-meta">
            <div><dt>Effective Date</dt><dd>{effectiveDate}</dd></div>
            <div><dt>Last Updated</dt><dd>{lastUpdated}</dd></div>
            <div><dt>Version</dt><dd>{version}</dd></div>
          </dl>
          <p>This policy explains how the SDHS Learning Portal handles information used to deliver and administer its educational programs.</p>
        </section>

        <div className="privacy-layout">
          <nav className="privacy-toc" aria-labelledby="privacy-toc-title">
            <h2 id="privacy-toc-title">Table of Contents</h2>
            <ol>{sections.map(([id, title]) => <li key={id}><a href={`#${id}`}>{title}</a></li>)}</ol>
          </nav>

          <article className="privacy-policy">
            <section id="introduction">
              <h2>1. Introduction</h2>
              <p>Sanatana Dharma Hindu Society (“SDHS,” “we,” “us,” or “our”) operates the SDHS Learning Portal. The platform supports volunteers participating in Fluent Reading, Memorization, and Revision programs and provides role-specific tools for students, teachers, and administrators.</p>
              <p>By using the platform, you acknowledge the information practices described in this policy.</p>
            </section>

            <section id="information-we-collect">
              <h2>2. Information We Collect</h2>
              <p>We collect and maintain information needed to operate the learning program:</p>
              <ul>
                <li>Volunteer ID, name, email address, and phone number.</li>
                <li>Program type, enrollment status, assigned group, and eligibility information.</li>
                <li>Attendance sessions and attendance history.</li>
                <li>Exam dates, slot bookings, chapters, syllabus progress, and teacher assignments.</li>
                <li>Exam results, grades, teacher comments, and learning progress.</li>
                <li>Role and account information needed for authentication and authorization.</li>
              </ul>
            </section>

            <section id="information-we-do-not-collect">
              <h2>3. Information We Do Not Collect</h2>
              <p>The platform does not intentionally collect GPS or precise location data, contacts, photos, videos, audio recordings, camera data, advertising identifiers, payment information, credit-card information, or marketing profiles.</p>
              <p>If platform capabilities change, this policy will be updated before newly required categories of information are collected.</p>
            </section>

            <section id="how-we-use-information">
              <h2>4. How We Use Information</h2>
              <p>Information is used only to authenticate users; process and administer enrollments; maintain attendance; support exam booking; assign teachers; record grading and feedback; prepare operational reports; administer the platform; and show educational history and progress.</p>
            </section>

            <section id="data-sharing">
              <h2>5. Data Sharing</h2>
              <p>SDHS does not sell personal information and does not share information for advertising. Information is available only to authorized SDHS teachers and administrators when required for educational and administrative responsibilities, and to service providers that host or distribute the platform.</p>
            </section>

            <section id="security">
              <h2>6. Security</h2>
              <p>The platform uses authenticated access, role-based authorization, HTTPS for production communications, JSON Web Tokens (JWTs) for authenticated sessions, and restricted administrative access. Users should protect their credentials and notify SDHS if they believe their account has been accessed without authorization.</p>
              <p>No system can guarantee absolute security, but SDHS limits access and uses safeguards appropriate to the platform’s operation.</p>
            </section>

            <section id="data-retention">
              <h2>7. Data Retention</h2>
              <p>Educational and administrative records may be retained for as long as reasonably necessary to maintain enrollment history, attendance history, examination records, learning progress, reporting, and program administration. Records may also be retained when required to resolve operational or account-related requests.</p>
            </section>

            <section id="childrens-privacy">
              <h2>8. Children’s Privacy</h2>
              <p>The platform is intended for educational participation in SDHS Bhagavad Gita programs. Parents or guardians may assist younger volunteers with registration, account access, and requests concerning their information. A parent or guardian may contact SDHS to request review or correction of a younger volunteer’s contact information.</p>
            </section>

            <section id="third-party-services">
              <h2>9. Third-Party Services</h2>
              <p>SDHS uses limited infrastructure and distribution providers to operate the platform:</p>
              <ul>
                <li><strong>Render</strong> for application hosting.</li>
                <li><strong>Supabase/PostgreSQL</strong> for managed database infrastructure.</li>
                <li><strong>Expo</strong> for mobile application development and distribution tooling.</li>
                <li><strong>Apple App Store and Google Play</strong> for mobile application distribution.</li>
              </ul>
              <p>These providers process technical or account-related information only as necessary to provide their services and operate under their own terms and privacy practices.</p>
            </section>

            <section id="user-rights">
              <h2>10. User Rights and Choices</h2>
              <p>Users may review and request updates to their email address and phone number through Account Settings or by contacting an authorized SDHS administrator. Users may also contact SDHS with questions about their educational records or to request an appropriate correction.</p>
            </section>

            <section id="policy-updates">
              <h2>11. Policy Updates</h2>
              <p>SDHS may update this policy when platform capabilities, information practices, or legal requirements change. The revised policy will be published on this page with updated effective date, last-updated date, and version information.</p>
            </section>

            <section id="contact">
              <h2>12. Contact</h2>
              <p>For privacy questions or requests, contact SDHS at <a href="mailto:sridattahumaneservices@gmail.com">sridattahumaneservices@gmail.com</a>.</p>
              <p className="privacy-contact-note">This privacy contact address should be replaced with the official SDHS privacy contact if a dedicated address is established.</p>
            </section>
          </article>
        </div>
      </main>

      <footer className="privacy-footer">
        <span>© SDHS Learning Portal</span>
        <Link to={ROUTES.PRIVACY_POLICY}>Privacy Policy</Link>
      </footer>
    </div>
  );
}

export default PrivacyPolicyPage;
