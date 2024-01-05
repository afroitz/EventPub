import { Outlet } from "react-router-dom";

const Layout: React.FC = () => {
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
            <button type="submit">Logout (not yet implemented)</button>
          </li>
        </ul>
      </nav>
      <div id="content">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
