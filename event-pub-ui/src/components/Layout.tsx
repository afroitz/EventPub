import { useContext } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const { logOut, loggedIn } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await logOut();
      navigate("/login");
    } catch (error) {
      console.error(error);
      alert("Error logging out. Please try again.");
    }
  };

  return (
    <div>
      <div>
        <h1>Event Pub</h1>
        {loggedIn && <p>Logged in!</p>}
        <nav>
          <ul>
            {loggedIn ? (
              <>
                <li>
                  <a href="/create">Create</a>
                </li>
                <li>
                  <a href="/list">List</a>
                </li>
                <li>
                  <button type="button" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <a href="/login">Login</a>
                </li>
                <li>
                  <a href="/register">Register</a>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
      <Outlet />
    </div>
  );
};

export default Layout;
