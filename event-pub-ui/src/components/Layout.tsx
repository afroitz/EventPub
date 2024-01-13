import { Outlet, useNavigate } from "react-router-dom";

const Layout: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch(process.env.REACT_APP_API_URL+'/logout', { method: 'POST' });
      if (!response.ok) {
        throw new Error('Logout failed');
      }
      navigate('/login'); // Redirect to login page
      console.log('Logout successful');
    } catch (error) {
      console.error(error);
      alert('Error logging out. Please try again.');
    }
  };

  return (
    <div>
      <h1>Event Pub</h1>
      <nav>
        <ul>
          <li>
            <a href="/create">Create</a>
          </li>
          <li>
            <a href="/list">List</a>
          </li>
          <li>
            <a href="/login">Login</a>
          </li>
          <li>
            <button type="button" onClick={handleLogout}>Logout</button>
          </li>
        </ul>
      </nav>
      <Outlet />
    </div>
  );
};

export default Layout;