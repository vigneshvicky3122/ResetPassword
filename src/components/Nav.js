import React from "react";

function Nav() {
  return (
    <div>
      <nav className="nav">
        <div className="nav-container">
          <div className="navbar-brand">Reset Password</div>
          <div className="nav-secondary">
            <a className="nav-link" href="/Dashboard">
              Dashboard
            </a>

            <a className="nav-link" href="/accounts/emailsignup">
              Sign up
            </a>
            <a
              className="nav-link"
              href="/accounts/password/reset/verification/email"
            >
              Forgot Password
            </a>

            <a className="nav-link" href="/accounts/login">
              Login
            </a>

            <a
              href="/accounts/login"
              onClick={() => window.localStorage.clear()}
              className="nav-link"
            >
              LogOut
            </a>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Nav;
