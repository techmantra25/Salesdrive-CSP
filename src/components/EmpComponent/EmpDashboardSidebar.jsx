import { Sidebar } from "flowbite-react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import {
  employeeSidebarConfig,
  need_employee_approval_for_po_paths,
} from "../../config/employeeSidebarConfig";
import { logout as logoutAction } from "../../redux/userSlice";
import { useLogoutMutation } from "../../redux/userApiSlice";

export const EmpDashboardSidebar = ({ sidebarOpen, onSidebarClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.user);
  const role = userInfo?.role;
  const { config } = useSelector((state) => state.config);
  const need_employee_approval_for_po =
    config?.functionalSettings?.need_employee_approval_for_po;

  const [logout] = useLogoutMutation();

  const handleLogOut = async () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;

    try {
      // Call logout API to clear cookie on backend
      await logout().unwrap();
      
      // Dispatch to clear Redux state and localStorage
      dispatch(logoutAction());
      
      if (role === "admin") {
        navigate("/sign-in?mode=admin");
        toast.success("Logout Successful!");
      } else {
        navigate("/sign-in?mode=employee");
        toast.success("Logout Successful!");
      }
    } catch (error) {
      // Even if API fails, still logout locally
      dispatch(logoutAction());
      
      if (role === "admin") {
        navigate("/sign-in?mode=admin");
        toast.success("Logout Successful!");
      } else {
        navigate("/sign-in?mode=employee");
        toast.success("Logout Successful!");
      }
    }
  };

  let empSidebarData = employeeSidebarConfig;

  // Render a single sidebar item
  const renderSidebarItem = (item) => {
    if (
      need_employee_approval_for_po !== "agent approval" &&
      need_employee_approval_for_po_paths.includes(item.path)
    ) {
      return null;
    }

    if (item.isLogout) {
      return (
        <Sidebar.Item icon={item.icon} key={item.label}>
          <button
            className="flex w-full items-center text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
            onClick={() => {
              handleLogOut();
              onSidebarClose();
            }}
          >
            <span>{item.label}</span>
          </button>
        </Sidebar.Item>
      );
    }

    return (
      <NavLink
        to={item.path}
        key={item.label}
        className={({ isActive }) =>
          `flex items-center text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 p-2 pl-4 ${
            isActive ? "bg-gray-200 dark:bg-gray-900" : ""
          }`
        }
        onClick={() => onSidebarClose()}
      >
        <item.icon size={20} />
        <span className="ms-3">{item.label}</span>
      </NavLink>
    );
  };

  // Render a collapse group
  const renderSidebarCollapse = (collapse) => {
    let children = collapse.children;
    children = children.filter((child) => {
      if (
        need_employee_approval_for_po !== "agent approval" &&
        need_employee_approval_for_po_paths.includes(child.path)
      ) {
        return false;
      }
      return true;
    });

    if (children.length === 0) {
      return null;
    }

    return (
      <Sidebar.Collapse
        icon={collapse.icon}
        label={collapse.label}
        key={collapse.label}
      >
        {children.map((child) => renderSidebarItem(child))}
      </Sidebar.Collapse>
    );
  };

  return (
    <>
      {sidebarOpen && (
        <aside
          className="fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform  bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700"
          aria-label="Sidebar"
        >
          <Sidebar aria-label="Sidebar with multi-level dropdown example">
            <Sidebar.Items>
              <Sidebar.ItemGroup>
                {empSidebarData?.map((item) =>
                  item.type === "item"
                    ? renderSidebarItem(item)
                    : renderSidebarCollapse(item)
                )}
              </Sidebar.ItemGroup>
            </Sidebar.Items>
          </Sidebar>
        </aside>
      )}
    </>
  );
};
