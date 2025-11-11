import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

export default function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-title">Drug Inventory</div>
        <div className="nav-links">
          <Link to="/drugs">All</Link>
          <Link to="/drugs/mine">Mine</Link>
          <Link to="/drugs/low_stock">Low Stock</Link>
          <Link to="/drugs/search">Search</Link>

          {!user ? (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          ) : (
            <>
              <span>{user.username}</span>
              <button onClick={onLogout}>Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
