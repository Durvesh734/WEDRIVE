const Login = () => {
  const handleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google";
  };

  return (
    <div className="login-wrapper">
      {/* LEFT PANEL */}
      <div className="login-left">
        <div className="login-left-content">
          <div className="login-badge">SLRTCE Internal System</div>

          <h1>Drive Distribution Portal</h1>

          <div className="login-description">
            A secure institutional platform for SLRTCE faculty members to
            distribute academic resources directly to registered student Google
            Drives.
          </div>

          <div className="login-meta">
            Restricted access • Institutional use only
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="login-right">
        <div className="login-card">
          <div className="login-card-header">Faculty Authentication</div>

          <div className="login-card-sub">
            Access requires verification using your official institutional
            Google account.
          </div>

          <div className="login-divider" />

          <div className="login-action-section">
            <button className="google-login-btn" onClick={handleLogin}>
              Continue with Google
            </button>

          </div>

          <div className="login-footer-note">
            By continuing, you confirm that you are a registered faculty member
            of Shree L.R. Tiwari College of Engineering.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
