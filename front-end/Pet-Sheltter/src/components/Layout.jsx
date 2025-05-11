import { Link } from "react-router-dom";
import "../styles/Layout.css";

export default function Layout({ children }) {
  return (
    <div className="app-container">
      <nav className="main-nav">
        <div className="nav-content container">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/login" className="nav-link">
            Login
          </Link>
          <Link to="/register" className="nav-link">
            Register
          </Link>
        </div>
      </nav>
      <main className="container">{children}</main>
    </div>
  );
}
