import { AiFillDashboard, AiOutlineMenuUnfold } from "react-icons/ai";
import { FaList, FaSignOutAlt } from "react-icons/fa";

export const employeeSidebarConfig = [
  {
    type: "item",
    label: "Dashboard",
    path: "/employee/dashboard",
    icon: AiFillDashboard,
  },
  {
    type: "collapse",
    label: "Purchase",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Purchase Order List",
        path: "/employee/purchase-order-list",
        icon: FaList,
      },
    ],
  },
  {
    type: "item",
    label: "Logout",
    path: "/logout",
    icon: FaSignOutAlt,
    isLogout: true,
  },
];

export const need_employee_approval_for_po_paths = [
  "/employee/purchase-order-list",
];
