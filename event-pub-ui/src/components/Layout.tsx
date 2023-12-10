import { Outlet } from "react-router-dom";

const Layout: React.FC = () => {
  return (
    <div>
      <h1>Event Pub</h1>
      <div id="content">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
