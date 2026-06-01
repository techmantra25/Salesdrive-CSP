import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FaSearch,
  FaTimes,
  FaSignOutAlt,
  FaChevronDown,
  FaChevronRight,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import {
  adminSidebarConfig,
  usersidebarconfig,
  subadminssidebarconfig,
  aaadminsesidebarconfig,
  salessidebarconfig,
  need_employee_approval_for_po_paths_for_admin,
  no_need_employee_approval_for_po_paths_for_admin,
} from "../config/adminSidebarConfig";
import { logout as logoutAction } from "../redux/userSlice";
import { useLogoutMutation } from "../redux/userApiSlice";

export const DashboardSidebar = ({ sidebarOpen, onSidebarClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.user);
  const role = useSelector((state) => state.permission?.data?.role);
  const permissionData = useSelector((state) => state.permission?.data?.data);

  const sidebarMap = {
    admin: adminSidebarConfig,
    user: usersidebarconfig,
    "sub-admins": subadminssidebarconfig,
    sales: salessidebarconfig,
    admine: aaadminsesidebarconfig,
  };

  const sidebarConfig = sidebarMap[role] ?? adminSidebarConfig;

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [logout] = useLogoutMutation();

  const { config } = useSelector((state) => state.config);
  const need_employee_approval_for_po =
    config?.functionalSettings?.need_employee_approval_for_po;

  const hasViewPermission = (slug) => {
    if (role === "admin") return true;
    if (!slug) return true;
    if (!permissionData) return false;

    for (const group of Object.values(permissionData)) {
      for (const page of Object.values(group)) {
        if (page?.pageSlug === slug) {
          return page?.view === true;
        }
      }
    }
    return false;
  };

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
              className="bg-yellow-200 dark:bg-yellow-600 px-0.5 rounded text-gray-900 dark:text-gray-100"
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

  useEffect(() => {
    if (searchQuery.trim()) {
      const groupsToExpand = new Set();
      sidebarConfig.forEach((item) => {
        if (item.type === "collapse") {
          const hasMatchingChildren = item.children.some(
            (child) =>
              child.label.toLowerCase().includes(searchQuery.toLowerCase()) &&
              hasViewPermission(child.slug)
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
  }, [searchQuery, sidebarConfig, permissionData]);

  const filterItems = (items, query) => {
    if (!query.trim()) return items;
    return items.filter((item) => {
      if (item.type === "item") {
        return item.label.toLowerCase().includes(query.toLowerCase());
      } else if (item.type === "collapse") {
        const childrenMatch = item.children.some(
          (child) =>
            child.label.toLowerCase().includes(query.toLowerCase()) &&
            hasViewPermission(child.slug)
        );
        const parentMatch = item.label
          .toLowerCase()
          .includes(query.toLowerCase());
        return parentMatch || childrenMatch;
      }
      return false;
    });
  };

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
      await logout().unwrap();
      dispatch(logoutAction());
      if (role === "admin") {
        navigate("/sign-in?mode=admin");
      } else if (role === "employee") {
        navigate("/sign-in?mode=employee");
      } else {
        navigate("/sign-in");
      }
      toast.success("Logout Successful!");
    } catch (error) {
      dispatch(logoutAction());
      if (role === "admin") {
        navigate("/sign-in?mode=admin");
      } else if (role === "employee") {
        navigate("/sign-in?mode=employee");
      } else {
        navigate("/sign-in");
      }
      toast.success("Logout Successful!");
    }
  };

  const toggleGroup = (label) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  const renderSidebarItem = (item, isChild = false) => {
    if (!hasViewPermission(item.slug)) return null;

    if (
      need_employee_approval_for_po !== "admin approval" &&
      need_employee_approval_for_po_paths_for_admin.includes(item.path)
    ) {
      return null;
    }

    if (
      need_employee_approval_for_po === "admin approval" &&
      no_need_employee_approval_for_po_paths_for_admin.includes(item.path)
    ) {
      return null;
    }

    if (item.isLogout) {
      return (
        <button
          onClick={() => {
            handleLogOut();
            onSidebarClose?.();
          }}
          className="flex items-center w-full gap-3 px-3 py-2.5 text-sm text-red-500 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200 group"
        >
          <FaSignOutAlt className="w-4 h-4 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
          <span className="font-medium">{highlightText(item.label, searchQuery)}</span>
        </button>
      );
    }

    return (
      <NavLink
        to={item.path}
        end={!item.path.endsWith("/*")}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all duration-200 group ${
            isActive
              ? isChild
                ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium"
                : "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/25 font-medium"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200"
          }`
        }
        onClick={() => onSidebarClose?.()}
      >
        {({ isActive }) => (
          <>
            {item.icon && (
              <item.icon
                className={`w-4 h-4 flex-shrink-0 transition-colors ${
                  isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                }`}
              />
            )}
            <span className="truncate">{highlightText(item.label, searchQuery)}</span>
          </>
        )}
      </NavLink>
    );
  };

  const renderSidebarCollapse = (collapse) => {
    let children = collapse.children;
    children = children.filter((child) => hasViewPermission(child.slug));

    if (searchQuery.trim()) {
      children = filterChildren(children, searchQuery);
    }

    children = children.filter((child) => {
      if (
        need_employee_approval_for_po !== "admin approval" &&
        need_employee_approval_for_po_paths_for_admin.includes(child.path)
      ) {
        return false;
      }
      return true;
    });

    if (children.length === 0) return null;

    const isExpanded = expandedGroups.has(collapse.label);

    return (
      <div key={collapse.label} className="space-y-1">
        <button
          onClick={() => toggleGroup(collapse.label)}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200 transition-all duration-200 group"
        >
          {collapse.icon && (
            <collapse.icon className="w-4 h-4 flex-shrink-0 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
          )}
          <span className="flex-1 text-left font-medium truncate">
            {highlightText(collapse.label, searchQuery)}
          </span>
          {isExpanded ? (
            <FaChevronDown className="w-3 h-3 text-gray-400 transition-transform" />
          ) : (
            <FaChevronRight className="w-3 h-3 text-gray-400 transition-transform" />
          )}
        </button>
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="ml-4 pl-4 border-l border-gray-200 dark:border-gray-700 space-y-1">
            {children.map((child) => renderSidebarItem(child, true))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {sidebarOpen && (
        <aside
          className="fixed top-0 left-0 z-40 w-64 h-screen bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex flex-col"
          aria-label="Sidebar"
        >
          {/* Logo / Header */}
          <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100 dark:border-gray-700">
            <NavLink to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                Calcutta Metal Corporation
              </span>
            </NavLink>
            <button
              onClick={onSidebarClose}
              className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close sidebar"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>

          {/* Search */}
          <div className="px-4 py-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-9 py-2.5 text-sm bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setExpandedGroups(new Set());
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label="Clear search"
                >
                  <FaTimes className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
            {(() => {
              const filteredItems = filterItems(sidebarConfig, searchQuery);
              if (filteredItems.length === 0 && searchQuery.trim()) {
                return (
                  <div className="px-3 py-8 text-xs text-gray-400 dark:text-gray-500 text-center">
                    <FaSearch className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>No results for &quot;{searchQuery}&quot;</p>
                  </div>
                );
              }
              return filteredItems.map((item) =>
                item.type === "item"
                  ? renderSidebarItem(item)
                  : renderSidebarCollapse(item)
              );
            })()}
          </nav>

          {/* Bottom spacer */}
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
              © 2026 Calcutta Metal Corporation CSP
            </p>
          </div>
        </aside>
      )}
    </>
  );
};