import logo from "../../../assets/images/logo.png";
import LoginForm from "../components/LoginForm";
import "../styles/login.css";

function LoginPage() {
  return (
    <div className="login-page">
      <header className="login-page__header">
        <div className="login-page__brand">
          SDHS Bhagavad Gita Memorization
        </div>
      </header>

      <main className="login-page__main">
        <div className="login-page__content">
          <img className="login-page__logo" src={logo} alt="SDHS Learning Portal" />
          <section className="login-page__card" aria-labelledby="login-title">
            <div className="login-page__eyebrow">Volunteer Portal</div>
            <h1 id="login-title" className="login-page__title">
              Sign in to your account
            </h1>
            <p className="login-page__description">
              Access your dashboard to manage schedules, track progress, and
              view assignments.
            </p>

            <LoginForm />

            <p className="login-page__hint">
              Default password is your <strong>Volunteer ID</strong>.
            </p>
          </section>

          <aside className="login-page__contact">
            <div className="login-page__contact-icon" aria-hidden="true">
              ☎
            </div>
            <div>
              <h2 className="login-page__contact-title">
                Want to join SDHS Volunteers?
              </h2>
              <p className="login-page__contact-text">
                Reach out to learn more about volunteering opportunities with
                Sri Datta Human Services.
              </p>
            </div>
          </aside>

          <footer className="login-page__footer">
            © 2025 <span>Sri Datta Human Services</span> · SDHS Bhagavad Gita
            Program
          </footer>
        </div>
      </main>
    </div>
  );
}

export default LoginPage;
