import { useEffect } from "react";
import { Link } from "react-router-dom";

import logo from "../../assets/images/logo.png";
import { ROUTES } from "../../constants/RouteConstants";
import { effectiveDate, lastUpdated, version } from "../../constants/legal";
import "./privacy-policy.css";

const pageTitle = "Delete Your SDHS Bhagavad Gita Learning Account";
const pageDescription = "Learn how to request deletion of your SDHS Bhagavad Gita Learning account and associated personal information.";

function setMeta(name: string, content: string, property = false) {
  const attribute = property ? "property" : "name";
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`);
  const created = element === null;
  const previousContent = element?.content;
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  element.content = content;
  return () => {
    if (created) {
      element.remove();
    } else if (previousContent !== undefined) {
      element.content = previousContent;
    }
  };
}

function DeleteAccountPage() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${pageTitle} | SDHS`;
    const restoreMetadata = [
      setMeta("description", pageDescription),
      setMeta("og:title", pageTitle, true),
      setMeta("og:description", pageDescription, true),
    ];
    return () => {
      document.title = previousTitle;
      restoreMetadata.forEach((restore) => restore());
    };
  }, []);

  return (
    <div className="privacy-page">
      <header className="privacy-header">
        <Link className="privacy-brand" to={ROUTES.HOME} aria-label="SDHS Learning Portal home">
          <img src={logo} alt="" />
          <span>SDHS Bhagavad Gita Learning Platform</span>
        </Link>
        <Link className="privacy-header__link" to={ROUTES.LOGIN}>Sign In</Link>
      </header>

      <main className="privacy-main" id="main-content">
        <section className="privacy-hero" aria-labelledby="delete-account-title">
          <p className="privacy-eyebrow">Account &amp; Privacy</p>
          <h1 id="delete-account-title">{pageTitle}</h1>
          <dl className="privacy-meta">
            <div><dt>Effective Date</dt><dd>{effectiveDate}</dd></div>
            <div><dt>Last Updated</dt><dd>{lastUpdated}</dd></div>
            <div><dt>Version</dt><dd>{version}</dd></div>
          </dl>
          <p>Users may request deletion of their SDHS account and the personal information associated with it.</p>
        </section>

        <article className="privacy-policy">
          <section>
            <h2>1. Overview</h2>
            <p>You may request permanent deletion of your SDHS Bhagavad Gita Learning account and associated personal information at any time.</p>
          </section>
          <section>
            <h2>2. How to Request Deletion</h2>
            <p>Email the SDHS administrator at <a href="mailto:sridattahumaneservices@gmail.com">sridattahumaneservices@gmail.com</a>, or contact SDHS through its official support contact. Include your Volunteer ID so the correct account can be identified. SDHS may verify your identity before processing the request.</p>
            <p className="privacy-contact-note"><strong>Administrative note:</strong> sridattahumaneservices@gmail.com is the current placeholder privacy contact and should be replaced when the official SDHS contact is confirmed.</p>
          </section>
          <section>
            <h2>3. What Data Will Be Deleted</h2>
            <p>Subject to the limited retention circumstances below, account deletion includes:</p>
            <ul>
              <li>Volunteer profile and contact information.</li>
              <li>Login account and authentication information.</li>
              <li>Enrollment and attendance history.</li>
              <li>Exam bookings and teacher evaluations.</li>
              <li>Associated learning progress.</li>
              <li>Other personal information maintained for the account.</li>
            </ul>
          </section>
          <section>
            <h2>4. What May Be Retained</h2>
            <p>Some information may be retained when legally required, to prevent fraud, for audit or security purposes, or during limited backup restoration windows. Any retained information will be minimized and protected from unnecessary use.</p>
          </section>
          <section>
            <h2>5. Processing Time</h2>
            <p>Deletion requests are normally processed within 30 days after the request and any required identity verification are received.</p>
          </section>
          <section>
            <h2>6. Account Access</h2>
            <p>After deletion is completed, you will no longer be able to sign in to the deleted account or access its learning records.</p>
          </section>
          <section>
            <h2>7. Children</h2>
            <p>A parent or legal guardian may request deletion on behalf of a minor. SDHS may request information needed to verify the requester’s authority.</p>
          </section>
          <section>
            <h2>8. Questions</h2>
            <p>For questions about account deletion, contact <a href="mailto:sridattahumaneservices@gmail.com">sridattahumaneservices@gmail.com</a>.</p>
            <p>For more information about how SDHS handles personal information, read the <Link to={ROUTES.PRIVACY_POLICY}>Privacy Policy</Link>.</p>
          </section>
        </article>
      </main>

      <footer className="privacy-footer">
        <span>© SDHS Bhagavad Gita Learning Platform</span>
        <Link to={ROUTES.PRIVACY_POLICY}>Privacy Policy</Link>
        <Link to={ROUTES.DELETE_ACCOUNT}>Delete Account</Link>
      </footer>
    </div>
  );
}

export default DeleteAccountPage;
