import { Sidebar } from "flowbite-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaSearch, FaTimes } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import {
  // subAdminPrimarySidebarConfig,
  need_employee_approval_for_po_paths_for_admin,
  no_need_employee_approval_for_po_paths_for_admin,
} from "../config/adminSidebarConfig";
import { logout as logoutAction } from "../redux/userSlice";
import { useLogoutMutation } from "../redux/userApiSlice";

export const SubAdminPrimaryDashboardSidebar = ({
  sidebarOpen,
  onSidebarClose,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.user);
  const role = userInfo?.role;
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [logout] = useLogoutMutation();

  const { config } = useSelector((state) => state.config);
  const need_employee_approval_for_po =
    config?.functionalSettings?.need_employee_approval_for_po;

  console.log(need_employee_approval_for_po, "need_employee_approval_for_po");

  // Function to highlight search terms in text
  const highlightText = (text, query) => {
    if (!query.trim()) return text;

    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);

    return (
      <>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <mark
              key={index}
              className="bg-yellow-200 dark:bg-yellow-600 px-1 rounded text-gray-900 dark:text-gray-100"
            >
              {part}
            </mark>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </>
    );
  };

  // Auto-expand collapsed groups when searching
  useEffect(() => {
    if (searchQuery.trim()) {
      const groupsToExpand = new Set();
      subAdminPrimarySidebarConfig.forEach((item) => {
        if (item.type === "collapse") {
          const hasMatchingChildren = item.children.some((child) =>
            child.label.toLowerCase().includes(searchQuery.toLowerCase())
          );
          if (
            hasMatchingChildren ||
            item.label.toLowerCase().includes(searchQuery.toLowerCase())
          ) {
            groupsToExpand.add(item.label);
          }
        }
      });
      setExpandedGroups(groupsToExpand);
    } else {
      setExpandedGroups(new Set());
    }
  }, [searchQuery]);

  // Function to filter items based on search query
  const filterItems = (items, query) => {
    if (!query.trim()) return items;

    return items.filter((item) => {
      if (item.type === "item") {
        return item.label.toLowerCase().includes(query.toLowerCase());
      } else if (item.type === "collapse") {
        const childrenMatch = item.children.some((child) =>
          child.label.toLowerCase().includes(query.toLowerCase())
        );
        const parentMatch = item.label
          .toLowerCase()
          .includes(query.toLowerCase());
        return parentMatch || childrenMatch;
      }
      return false;
    });
  };

  // Function to filter children in collapse groups
  const filterChildren = (children, query) => {
    if (!query.trim()) return children;
    return children.filter((child) =>
      child.label.toLowerCase().includes(query.toLowerCase())
    );
  };

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
      } else if (role === "employee") {
        navigate("/sign-in?mode=employee");
        toast.success("Logout Successful!");
      } else {
        navigate("/sign-in");
        toast.success("Logout Successful!");
      }
    } catch (error) {
      // Even if API fails, still logout locally
      dispatch(logoutAction());
      
      if (role === "admin") {
        navigate("/sign-in?mode=admin");
        toast.success("Logout Successful!");
      } else if (role === "employee") {
        navigate("/sign-in?mode=employee");
        toast.success("Logout Successful!");
      } else {
        navigate("/sign-in");
        toast.success("Logout Successful!");
      }
    }
  };

  // Render a single sidebar item
  const renderSidebarItem = (item) => {
    if (
      need_employee_approval_for_po !== "admin approval" &&
      need_employee_approval_for_po_paths_for_admin.includes(item.path)
    ) {
      return null;
    }

    if (
      need_employee_approval_for_po == "admin approval" &&
      no_need_employee_approval_for_po_paths_for_admin.includes(item.path)
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
            <span>{highlightText(item.label, searchQuery)}</span>
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
        <span className="ms-3">{highlightText(item.label, searchQuery)}</span>
      </NavLink>
    );
  };

  // Render a collapse group
  const renderSidebarCollapse = (collapse) => {
    let children = collapse.children;

    // Apply search filter first
    if (searchQuery.trim()) {
      children = filterChildren(children, searchQuery);
    }

    // Then apply approval filter
    children = children.filter((child) => {
      if (
        need_employee_approval_for_po !== "admin approval" &&
        need_employee_approval_for_po_paths_for_admin.includes(child.path)
      ) {
        return false;
      }
      return true;
    });

    if (children.length === 0) {
      return null;
    }

    const isExpanded = expandedGroups.has(collapse.label);

    return (
      <Sidebar.Collapse
        icon={collapse.icon}
        label={highlightText(collapse.label, searchQuery)}
        key={collapse.label}
        open={isExpanded}
        className="text-xs"
      >
        {children.map((child) => renderSidebarItem(child))}
      </Sidebar.Collapse>
    );
  };

  return (
    <>
      {sidebarOpen && (
        <aside
          className="fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform  bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700 text-xs"
          aria-label="Sidebar"
        >
          <Sidebar aria-label="Sidebar with multi-level dropdown example">
            <Sidebar.Items>
              <Sidebar.ItemGroup>
                {/* Search Input */}
                <div className="mb-4 relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaSearch className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search menu items..."
                    className="w-full pl-10 pr-10 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setExpandedGroups(new Set());
                      }}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      aria-label="Clear search"
                    >
                      <FaTimes className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </Sidebar.ItemGroup>
            </Sidebar.Items>
            <Sidebar.Items>
              <Sidebar.ItemGroup>
                {(() => {
                  const filteredItems = filterItems(
                    subAdminPrimarySidebarConfig,
                    searchQuery
                  );
                  if (filteredItems.length === 0 && searchQuery.trim()) {
                    return (
                      <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                        No results found for "{searchQuery}"
                      </div>
                    );
                  }
                  return filteredItems.map((item) =>
                    item.type === "item"
                      ? renderSidebarItem(item)
                      : renderSidebarCollapse(item)
                  );
                })()}
              </Sidebar.ItemGroup>
            </Sidebar.Items>
          </Sidebar>
        </aside>
      )}
    </>
  );
};
