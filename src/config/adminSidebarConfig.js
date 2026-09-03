// src/config/adminSidebarConfig.js
import { AiFillDashboard, AiOutlineMenuUnfold } from "react-icons/ai";
import { BiDisc, BiSolidCategory } from "react-icons/bi";
import { BsCollectionFill } from "react-icons/bs";
import { CiSettings } from "react-icons/ci";
import {
  FaLayerGroup,
  FaList,
  FaListAlt,
  FaProductHunt,
  FaRegBuilding,
  FaRoute,
  FaSignOutAlt,
  FaUsers,
  FaWarehouse,
} from "react-icons/fa";
import { FaCodePullRequest, FaPerson, FaUsersGear } from "react-icons/fa6";
import { IoIosAdd, IoIosImages } from "react-icons/io";
import { IoPricetags } from "react-icons/io5";
import { LuBookDown } from "react-icons/lu";
import { MdChecklist, MdVerifiedUser } from "react-icons/md";
import { TbMicrophone2 } from "react-icons/tb";


// IF you here to add any page then u have to add for  Super admin , admin ,sub-admin, user, sales

// This IS For Super Admin Sidebar Configurations////////////////////////////////////////////////////////////////////////////////////////

export const adminSidebarConfig = [
  {
    type: "item",
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: AiFillDashboard,
  },
  {
    type: "collapse",
    label: "Reports",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Stock Report",
        path: "/admin/stock-report",
        icon: LuBookDown,
      },

      {
        label: "Stock Ledger ",
        path: "/admin/stock-report-ledger",
        icon: LuBookDown,
      },
      {
        label: "Distributor Inventory Report",
        path: "/admin/distributor-inventory-report",
        icon: LuBookDown,
      },
      {
        label: "Purchase Order Report",
        path: "/admin/purchase-order-report",
        icon: LuBookDown,
      },
      {
        label: "Primary Invoice Report",
        path: "/admin/primary-invoice-report",
        icon: LuBookDown,
      },
      {
        label: "Sales Order Report",
        path: "/admin/order-report",
        icon: LuBookDown,
      },
      {
        label: "Sales Bill Report",
        path: "/admin/sales-bill-report",
        icon: LuBookDown,
      },
      {
        label: "Order vs Bill Report",
        path: "/admin/Order-to-bill-report",
        icon: LuBookDown,
      },

      {
        label: "Sales Return Report",
        path: "/admin/sales-return-report",
        icon: LuBookDown,
      },
      {
        label: "Distributor RBP Ledger",
        path: "/admin/distributor-rbp-ledger",
        icon: LuBookDown,
      },
      {
        label: "Retailer RBP Ledger",
        path: "/admin/retailer-rbp-ledger",
        icon: LuBookDown,
      },
      {
        label: "Multiplier Transaction History",
        path: "/admin/multiplier-transaction-history",
        icon: LuBookDown,
      },
      {
        label: "Usage Report",
        path: "/admin/usage-report",
        icon: LuBookDown,
      },

      // {
      //   label: "Stock Adjustment Report",
      //   path: "/admin/stock-adjustment-report",
      //   icon: LuBookDown,
      // },

      // {
      //   label: "Collection Report",
      //   path: "/admin/collection-report",
      //   icon: LuBookDown,
      // },
    ],
  },
  {
    type: "collapse",
    label: "Geo Hierarchy",
    icon: AiOutlineMenuUnfold,
    children: [
      // {
      //   label: "Zone",
      //   path: "/admin/country",
      //   icon: BiSolidCategory,
      // },
      {
        label: "State",
        path: "/admin/state",
        icon: FaLayerGroup,
      },
      // {
      //   label: "Region",
      //   path: "/admin/region",
      //   icon: BsCollectionFill,
      // },
      {
        label: "District",
        path: "/admin/district",
        icon: BsCollectionFill,
      },
      {
        label: "Zone",
        path: "/admin/sub-division",
        icon: BsCollectionFill,
        slug: "sub-division",
      },
    ],
  },
  {
    type: "collapse",
    label: "Product Master",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Brand",
        path: "/admin/brand",
        icon: MdVerifiedUser,
      },
      {
        label: "Sub-Brand",
        path: "/admin/sub-brand",
        icon: BiDisc,
      },
      {
        label: "Category",
        path: "/admin/category",
        icon: BiSolidCategory,
      },
      {
        label: "Collection",
        path: "/admin/collection",
        icon: BsCollectionFill,
      },
      {
        label: "Product",
        path: "/admin/products",
        icon: FaProductHunt,
      },
    ],
  },
  {
    type: "collapse",
    label: "Pricing Master",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Pricing",
        path: "/admin/pricing",
        icon: IoPricetags,
      },
      {
        label: "Pricing Category",
        path: "/admin/pricing-category",
        icon: IoPricetags,
      }
      // {
      //   label: "Price Update",
      //   path: "/admin/price-update",
      //   icon: IoPricetags,
      // },
    ],
  },
  // {
  //   type: "collapse",
  //   label: "Plant Master",
  //   icon: AiOutlineMenuUnfold,
  //   children: [
  //     {
  //       label: "Plant",
  //       path: "/admin/plant",
  //       icon: FaRegBuilding,
  //     },
  //   ],
  // },
  {
    type: "collapse",
    label: "Cancel Reason Master",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Reasons",
        path: "/admin/reason-master",
        icon: IoIosAdd,
      },
    ],
  },
  {
    type: "collapse",
    label: "Distributor Master",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Distributer",
        path: "/admin/distributer",
        icon: FaUsers,
      },
    ],
  },
  {
    type: "collapse",
    label: "Sales Hierarchy",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Designation",
        path: "/admin/designation",
        icon: FaUsers,
      },
      {
        label: "Employee",
        path: "/admin/employee",
        icon: FaPerson,
      },
    ],
  },
  {
    type: "collapse",
    label: "Route Master",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Beat",
        path: "/admin/beat",
        icon: FaRoute,
      },
      {
        label: "Beat Mapping",
        path: "/admin/beat-mapping",
        icon: FaUsersGear,
      },
    ],
  },
  // {
  //   type: "collapse",
  //   label: "Beat Mapping",
  //   icon: AiOutlineMenuUnfold,
  //   children: [
  //     {
  //       label: "Beat Mapping",
  //       path: "/admin/beat-mapping",
  //       icon: FaUsersGear,
  //     },
  //   ],
  // },
  // {
  //   type: "collapse",
  //   label: "Lead Management",
  //   icon: AiOutlineMenuUnfold,
  //   children: [
  //     {
  //       label: "Lead Approval",
  //       path: "/admin/outlet-requests",
  //       icon: FaCodePullRequest,
  //     },
  //   ],
  // },
  {
    type: "collapse",
    label: "Outlet Master",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Add Outlet",
        path: "/admin/outlet-requests",
        icon: FaCodePullRequest,
      },
      {
        label: "Outlet List",
        path: "/admin/outlet-list",
        icon: FaCodePullRequest,
      },
      // {
      //   label: "Transfer/Copy",
      //   path: "/admin/outlet-transfer-copy",
      //   icon: FaCodePullRequest,
      // },
    ],
  },
  {
    type: "collapse",
    label: "Purchase",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Supplier Master",
        path: "/admin/supplier-list",
        icon: FaListAlt,
      },

      // {
      //   label: "Purchase Order List",
      //   path: "/admin/purchase-order-list",
      //   icon: FaList,
      // },
      {
        label: "Purchase Invoice Log",
        path: "/admin/purchase-invoice-log",
        icon: FaList,
      },
      {
        label: "Purchase  Order Log",
        path: "/admin/purchase-order-log",
        icon: FaList,
      },
      {
        label: "Purchase Return Log",
        path: "/admin/purchase-return-log",
        icon: FaList,
      },
    ],
  },
  {
    type: "collapse",
    label: "Sales",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Sales Order Log",
        path: "/admin/sales-order-log",
        icon: FaListAlt,
      },
      {
        label: "DB Orders List",
        path: "/admin/all-db-orders-list",
        icon: FaListAlt,
      },
    ],
  },
  {
    type: "collapse",
    label: "Godown Master",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Add Godown",
        path: "/admin/godown-add",
        icon: FaWarehouse,
      },
    ],
  },

  // {
  //   type: "collapse",
  //   label: "RBP App",
  //   icon: AiOutlineMenuUnfold,
  //   children: [
  //     // {
  //     //   label: "App Banner",
  //     //   path: "/admin/rvp-app-banner",
  //     //   icon: PiFlagBannerFoldLight,
  //     // },
  //     // {
  //     //   label: "Gift Master",
  //     //   path: "/admin/rbp-reward-products",
  //     //   icon: FaGift,
  //     // },
  //     // {
  //     //   label: "Terms & Conditions",
  //     //   path: "/admin/rvp-terms-conditions",
  //     //   icon: MdChecklist,
  //     // },
  //     // {
  //     //   label: "Catalogue",
  //     //   path: "/admin/rvp-catalogue",
  //     //   icon: MdChecklist,
  //     // },
  //     {
  //       label: "Multiplier Slab Config",
  //       path: "/admin/retailer-multiplier-slab-config",
  //       icon: MdChecklist,
  //     },
  //     {
  //       label: "Multiplier Transactions",
  //       path: "/admin/retailer-multiplier-transactions",
  //       icon: MdChecklist,
  //     },
  //     {
  //       label: "Distributor Transactions",
  //       path: "/admin/rbp-reward-transactions",
  //       icon: MdChecklist,
  //     },
  //     {
  //       label: "Retailer Transaction History",
  //       path: "/admin/retailer-transaction-history",
  //       icon: MdChecklist,
  //     },
  //     {
  //       label: "Reward Products",
  //       path: "/admin/rbp-reward-products",
  //       icon: FaGift,
  //     },
  //     {
  //       label: "RBP Catalogue",
  //       path: "/admin/rbp-catalogue",
  //       icon: GrCatalogOption,
  //     },
  //     {
  //       label: "RBP Banner",
  //       path: "/admin/rbp-banner",
  //       icon: GiTatteredBanner,
  //     },
  //     {
  //       label: "Terms & Conditions",
  //       path: "/admin/rvp-terms-conditions",
  //       icon: MdChecklist,
  //     },
  //     {
  //       label: "Retailer Orders",
  //       path: "/admin/retailer-orders",
  //       icon: LiaBorderStyleSolid,
  //     },
  //     {
  //       label: "App Versions",
  //       path: "/admin/app-versions",
  //       icon: FaMobileAlt,
  //     },
  //   ],
  // },
  {
    type: "collapse",
    label: "Settings & Configs",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Settings & Configs",
        path: "/admin/settings",
        icon: CiSettings,
      },
      // {
      //   label: "Cron Settings",
      //   path: "/admin/cron-settings",
      //   icon: CiSettings,
      // },
      {
        label: "Page Settings",
        path: "/admin/create-page",
        icon: CiSettings,
      },
    ],
  },
  // {
  //   type: "collapse",
  //   label: "Target VS  Achievement",
  //   icon: AiOutlineMenuUnfold,
  //   children: [
  //     {
  //       label: "Primary Slab Setting ",
  //       path: "/admin/primary-slab",
  //       icon: CiSettings,
  //     },

  //     {
  //       label: "Primary Target VS Achievement Setting",
  //       path: "/admin/primary-target-setting",
  //       icon: CiSettings,
  //     },

  //     {
  //       label: "Secondary Slab Setting",
  //       path: "/admin/secondary-slab",
  //       icon: CiSettings,
  //     },
  //     {
  //       label: "Secondary Target VS Achievement Setting",
  //       path: "/admin/secondary-target",
  //       icon: CiSettings,
  //     },
  //   ],
  // },
  {
    type: "collapse",
    label: "User Management",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "User Management",
        path: "/admin/user-management",
        icon: FaUsers,
      },
    ],
  },

  {
    type: "item",
    label: "Image Converter",
    path: "/admin/image-converter",
    icon: IoIosImages,
  },
  // {
  //   type: "item",
  //   label: "Announcements",
  //   path: "/admin/announcements",
  //   icon: TbMicrophone2,
  // },
  {
    type: "item",
    label: "HelpDesk",
    path: "/admin/view-helpdesk",
    icon: MdChecklist,
  },
  {
    type: "item",
    label: "Logout",
    path: "/logout",
    icon: FaSignOutAlt,
    isLogout: true,
  },
];

// User Sde bar Config//////////////////////////////////////////////////////////////////////////////////////////////////////////

export const usersidebarconfig = [
  {
    type: "item",
    label: "Dashboard",
    path: "/user/dashboard",
    icon: AiFillDashboard,
  },
  {
    type: "collapse",
    label: "Reports",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Stock Report",
        path: "/user/stock-report",
        icon: LuBookDown,
        slug: "stock-report",
      },
      {
        label: "Distributor Inventory Report",
        path: "/user/distributor-inventory-report",
        icon: LuBookDown,
        slug: "distributor-inventory-report",
      },
      {
        label: "Stock Ledger ",
        path: "/user/stock-report-ledger",
        icon: LuBookDown,
        slug: "stock-ledger",
      },
      {
        label: "Purchase Order Report",
        path: "/user/purchase-order-report",
        icon: LuBookDown,
        slug: "purchase-order-report",
      },
      {
        label: "Primary Invoice Report",
        path: "/user/primary-invoice-report",
        icon: LuBookDown,
        slug: "primary-invoice-report",
      },
      {
        label: "Sales Order Report",
        path: "/user/order-report",
        icon: LuBookDown,
        slug: "sales-order-report",
      },
      {
        label: "Sales Bill Report",
        path: "/user/sales-bill-report",
        icon: LuBookDown,
        slug: "sales-bill-report",
      },
      {
        label: "Order vs Bill Report",
        path: "/user/Order-to-bill-report",
        icon: LuBookDown,
        slug: "order-vs-bill-report",
      },

      {
        label: "Sales Return Report",
        path: "/user/sales-return-report",
        icon: LuBookDown,
        slug: "sales-return-report",
      },
      {
        label: "Distributor RBP Ledger",
        path: "/user/distributor-rbp-ledger",
        icon: LuBookDown,
        slug: "distributor-rbp-ledger",
      },
      {
        label: "Retailer RBP Ledger",
        path: "/user/retailer-rbp-ledger",
        icon: LuBookDown,
        slug: "retailer-rbp-ledger",
      },
      {
        label: "Usage Report",
        path: "/user/usage-report",
        icon: LuBookDown,
        slug: "usage-report",
      },

      // {
      //   label: "Stock Adjustment Report",
      //   path: "/admin/stock-adjustment-report",
      //   icon: LuBookDown,
      // },

      // {
      //   label: "Collection Report",
      //   path: "/admin/collection-report",
      //   icon: LuBookDown,
      // },
    ],
  },
  {
    type: "collapse",
    label: "Geo Hierarchy",
    icon: AiOutlineMenuUnfold,
    children: [
      // {
      //   label: "Zone",
      //   path: "/user/zone",
      //   icon: BiSolidCategory,
      //   slug: "zone",
      // },
      {
        label: "State",
        path: "/user/state",
        icon: FaLayerGroup,
        slug: "state",
      },
      // {
      //   label: "Region",
      //   path: "/user/region",
      //   icon: BsCollectionFill,
      //   slug: "region",
      // },
      {
        label: "District",
        path: "/user/district",
        icon: BsCollectionFill,
        slug: "district",
      },
      {
        label: "Zone",
        path: "/user/sub-division",
        icon: BsCollectionFill,
        slug: "sub-division",
      },
    ],
  },
  {
    type: "collapse",
    label: "Product Master",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Brand",
        path: "/user/brand",
        icon: MdVerifiedUser,
        slug: "brand",
      },
      {
        label: "Sub-Brand",
        path: "/user/sub-brand",
        icon: BiDisc,
        slug: "sub-brand",
      },
      {
        label: "Category",
        path: "/user/category",
        icon: BiSolidCategory,
        slug: "category",
      },
      {
        label: "Collection",
        path: "/user/collection",
        icon: BsCollectionFill,
        slug: "collection",
      },
      {
        label: "Product",
        path: "/user/products",
        icon: FaProductHunt,
        slug: "product",
      },
    ],
  },
  {
    type: "collapse",
    label: "Pricing Master",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Pricing",
        path: "/user/pricing",
        icon: IoPricetags,
        slug: "pricing",
      },
      {
        
        label: "Pricing Category",
        path: "/user/pricing-category",
        icon: IoPricetags,
        slug: "pricing-category",
      }
      
      // {
      //   label: "Price Update",
      //   path: "/user/price-update",
      //   icon: IoPricetags,
      //   slug: "price-update",
      // },
    ],
  },
  // {
  //   type: "collapse",
  //   label: "Plant Master",
  //   icon: AiOutlineMenuUnfold,
  //   children: [
  //     {
  //       label: "Plant",
  //       path: "/user/plant",
  //       icon: FaRegBuilding,
  //       slug: "plant",
  //     },
  //   ],
  // },
  {
    type: "collapse",
    label: "Cancel Reason Master",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Reasons",
        path: "/user/reason-master",
        icon: IoIosAdd,
        slug: "reasons",
      },
    ],
  },
  {
    type: "collapse",
    label: "Distributor Master",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Distributer",
        path: "/user/distributer",
        icon: FaUsers,
        slug: "distributor",
      },
    ],
  },
  {
    type: "collapse",
    label: "Sales Hierarchy",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Designation",
        path: "/user/designation",
        icon: FaUsers,
        slug: "designation",
      },
      {
        label: "Employee",
        path: "/user/employee",
        icon: FaPerson,
        slug: "employee",
      },
    ],
  },
  {
    type: "collapse",
    label: "Route Master",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Beat",
        path: "/user/beat",
        icon: FaRoute,
        slug: "beat",
      },
      {
        label: "Beat Mapping",
        path: "/user/beat-mapping",
        icon: FaUsersGear,
        slug: "beat-mapping",
      },
    ],
  },
  // {
  //   type: "collapse",
  //   label: "Beat Mapping",
  //   icon: AiOutlineMenuUnfold,
  //   children: [
  //     {
  //       label: "Beat Mapping",
  //       path: "/user/beat-mapping",
  //       icon: FaUsersGear,
  //     },
  //   ],
  // },
  // {
  //   type: "collapse",
  //   label: "Lead Management",
  //   icon: AiOutlineMenuUnfold,
  //   children: [
  //     {
  //       label: "Lead Approval",
  //       path: "/user/outlet-requests",
  //       icon: FaCodePullRequest,
  //     },
  //   ],
  // },
  {
    type: "collapse",
    label: "Outlet Master",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Add Outlet",
        path: "/user/outlet-requests",
        icon: FaCodePullRequest,
        slug: "outlet-lead",
      },
      {
        label: "Outlet List",
        path: "/user/outlet-list",
        icon: FaCodePullRequest,
        slug: "outlet-list",
      },
      // {
      //   label: "Transfer/Copy",
      //   path: "/admin/outlet-transfer-copy",
      //   icon: FaCodePullRequest,
      // },
    ],
  },
  {
    type: "collapse",
    label: "Purchase",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Supplier Master",
        path: "/user/supplier-list",
        icon: FaListAlt,
        slug: "supplier-master",
      },

      // {
      //   label: "Purchase Order List",
      //   path: "/user/purchase-order-list",
      //   icon: FaList,
      //   slug:"purchase-order-list"
      // },
      {
        label: "Purchase Invoice Log",
        path: "/user/purchase-invoice-log",
        icon: FaList,
        slug: "purchase-invoice-log",
      },
      {
        label: "Purchase  Order Log",
        path: "/user/purchase-order-log",
        icon: FaList,
        slug: "purchase-order-log",
      },
      {
        label: "Purchase Return Log",
        path: "/user/purchase-return-log",
        icon: FaList,
        slug: "purchase-return-log",
      },
    ],
  },
  {
    type: "collapse",
    label: "Sales",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Sales Order Log",
        path: "/user/sales-order-log",
        icon: FaListAlt,
        slug: "sales-order-log",
      },
      {
        label: "DB Orders List",
        path: "/user/all-db-orders-list",
        icon: FaListAlt,
        slug: "db-orders-list",
      },
    ],
  },
  {
    type: "collapse",
    label: "Godown Master",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Add Godown",
        path: "/user/godown-add",
        icon: FaWarehouse,
      },
    ],
  },

  // {
  //   type: "collapse",
  //   label: "RBP App",
  //   icon: AiOutlineMenuUnfold,
  //   children: [
  //     // {
  //     //   label: "App Banner",
  //     //   path: "/user/rvp-app-banner",
  //     //   icon: PiFlagBannerFoldLight,
  //     // },
  //     // {
  //     //   label: "Gift Master",
  //     //   path: "/user/rbp-reward-products",
  //     //   icon: FaGift,
  //     // },
  //     // {
  //     //   label: "Terms & Conditions",
  //     //   path: "/user/rvp-terms-conditions",
  //     //   icon: MdChecklist,
  //     // },
  //     // {
  //     //   label: "Catalogue",
  //     //   path: "/user/rvp-catalogue",
  //     //   icon: MdChecklist,
  //     // },
  //     {
  //       label: "Multiplier Slab Config",
  //       path: "/user/retailer-multiplier-slab-config",
  //       icon: MdChecklist,
  //       slug: "multiplier-slab-config",
  //     },
  //     {
  //       label: "Multiplier Transactions",
  //       path: "/user/retailer-multiplier-transactions",
  //       icon: MdChecklist,
  //       slug: "multiplier-transactions",
  //     },
  //     {
  //       label: "Distributor Transactions",
  //       path: "/user/rbp-reward-transactions",
  //       icon: MdChecklist,
  //       slug: "distributor-transactions",
  //     },
  //     {
  //       label: "Retailer Transaction History",
  //       path: "/user/retailer-transaction-history",
  //       icon: MdChecklist,
  //       slug: "retailer-transaction-history",
  //     },
  //     {
  //       label: "Reward Products",
  //       path: "/user/rbp-reward-products",
  //       icon: FaGift,
  //       slug: "reward-products",
  //     },
  //     {
  //       label: "RBP Catalogue",
  //       path: "/user/rbp-catalogue",
  //       icon: GrCatalogOption,
  //       slug: "rbp-catalogue",
  //     },
  //     {
  //       label: "RBP Banner",
  //       path: "/user/rbp-banner",
  //       icon: GiTatteredBanner,
  //       slug: "rbp-banner",
  //     },
  //     {
  //       label: "Terms & Conditions",
  //       path: "/user/rvp-terms-conditions",
  //       icon: MdChecklist,
  //       slug: "terms-and-conditions",
  //     },
  //     {
  //       label: "Retailer Orders",
  //       path: "/user/retailer-orders",
  //       icon: LiaBorderStyleSolid,
  //       slug: "retailer-orders",
  //     },
  //     {
  //       label: "App Versions",
  //       path: "/user/app-versions",
  //       icon: FaMobileAlt,
  //       slug: "app-versions",
  //     },
  //   ],
  // },
  {
    type: "collapse",
    label: "Settings & Configs",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Settings & Configs",
        path: "/user/settings",
        icon: CiSettings,
        slug: "settings-configs",
      },
    ],
  },
  // {
  //   type: "collapse",
  //   label: "Target VS  Achievement",
  //   icon: AiOutlineMenuUnfold,
  //   children: [
  //     {
  //       label: "Primary Slab Setting ",
  //       path: "/user/primary-slab",
  //       icon: CiSettings,
  //       slug: "primary-slab-setting",
  //     },

  //     {
  //       label: "Primary Target VS Achievement Setting",
  //       path: "/user/primary-target-setting",
  //       icon: CiSettings,
  //       slug: "primary-target-vs-achievement-setting",
  //     },

  //     {
  //       label: "Secondary Slab Setting",
  //       path: "/user/secondary-slab",
  //       icon: CiSettings,
  //       slug: "secondary-slab-setting",
  //     },
  //     {
  //       label: "Secondary Target VS Achievement Setting",
  //       path: "/user/secondary-target",
  //       icon: CiSettings,
  //       slug: "secondary-target-vs-achievement-setting",
  //     },
  //   ],
  // },
  //   {
  //   type: "collapse",
  //   label: "User Management",
  //   icon: AiOutlineMenuUnfold,
  //   children: [
  //     {
  //       label: "User Management",
  //       path: "/user/user-management",
  //       icon: FaUsers,
  //     },
  //   ],
  // },

  {
    type: "item",
    label: "Image Converter",
    path: "/user/image-converter",
    icon: IoIosImages,
    slug: "image-converter",
  },
  {
    type: "item",
    label: "HelpDesk",
    path: "/user/view-helpdesk",
    icon: MdChecklist,
    slug: "helpdesk",
  },
  {
    type: "item",
    label: "Announcements",
    path: "/user/announcements",
    icon: TbMicrophone2,
  },
  {
    type: "item",
    label: "Logout",
    path: "/logout",
    icon: FaSignOutAlt,
    isLogout: true,
  },
];

// This is For  user sidebarcongig //////////////////////////////////////////////////////////////////////////////////////////

export const subadminssidebarconfig = [
  {
    type: "item",
    label: "Dashboard",
    path: "/sub-admins/dashboard",
    icon: AiFillDashboard,
  },
  {
    type: "collapse",
    label: "Reports",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Stock Report",
        path: "/sub-admins/stock-report",
        icon: LuBookDown,
        slug: "stock-report",
      },
      {
        label: "Distributor Inventory Report",
        path: "/sub-admins/distributor-inventory-report",
        icon: LuBookDown,
        slug: "distributor-inventory-report",
      },
      {
        label: "Stock Ledger ",
        path: "/sub-admins/stock-report-ledger",
        icon: LuBookDown,
        slug: "stock-ledger",
      },
      {
        label: "Purchase Order Report",
        path: "/sub-admins/purchase-order-report",
        icon: LuBookDown,
        slug: "purchase-order-report",
      },
      {
        label: "Primary Invoice Report",
        path: "/sub-admins/primary-invoice-report",
        icon: LuBookDown,
        slug: "primary-invoice-report",
      },
      {
        label: "Sales Order Report",
        path: "/sub-admins/order-report",
        icon: LuBookDown,
        slug: "sales-order-report",
      },
      {
        label: "Sales Bill Report",
        path: "/sub-admins/sales-bill-report",
        icon: LuBookDown,
        slug: "sales-bill-report",
      },
      {
        label: "Order vs Bill Report",
        path: "/sub-admins/order-to-bill-report",
        icon: LuBookDown,
        slug: "order-vs-bill-report",
      },

      {
        label: "Sales Return Report",
        path: "/sub-admins/sales-return-report",
        icon: LuBookDown,
        slug: "sales-return-report",
      },
      {
        label: "Distributor RBP Ledger",
        path: "/sub-admins/distributor-rbp-ledger",
        icon: LuBookDown,
        slug: "distributor-rbp-ledger",
      },
      {
        label: "Retailer RBP Ledger",
        path: "/sub-admins/retailer-rbp-ledger",
        icon: LuBookDown,
        slug: "retailer-rbp-ledger",
      },
      {
        label: "Usage Report",
        path: "/sub-admins/usage-report",
        icon: LuBookDown,
        slug: "usage-report",
      },

      // {
      //   label: "Stock Adjustment Report",
      //   path: "/admin/stock-adjustment-report",
      //   icon: LuBookDown,
      // },

      // {
      //   label: "Collection Report",
      //   path: "/admin/collection-report",
      //   icon: LuBookDown,
      // },
    ],
  },
  {
    type: "collapse",
    label: "Geo Hierarchy",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Zone",
        path: "/sub-admins/zone",
        icon: BiSolidCategory,
        slug: "zone",
      },
      {
        label: "State",
        path: "/sub-admins/state",
        icon: FaLayerGroup,
        slug: "state",
      },
      {
        label: "Region",
        path: "/sub-admins/region",
        icon: BsCollectionFill,
        slug: "region",
      },
      {
        label: "District",
        path: "/sub-admins/district",
        icon: BsCollectionFill,
        slug: "district",
      },
      {
        label: "Zone",
        path: "/sub-admins/sub-division",
        icon: BsCollectionFill,
        slug: "sub-division",
      },
    ],
  },
  {
    type: "collapse",
    label: "Product Master",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Brand",
        path: "/sub-admins/brand",
        icon: MdVerifiedUser,
        slug: "brand",
      },
      {
        label: "Sub-Brand",
        path: "/sub-admins/sub-brand",
        icon: BiDisc,
        slug: "sub-brand",
      },
      {
        label: "Category",
        path: "/sub-admins/category",
        icon: BiSolidCategory,
        slug: "category",
      },
      {
        label: "Collection",
        path: "/sub-admins/collection",
        icon: BsCollectionFill,
        slug: "collection",
      },
      {
        label: "Product",
        path: "/sub-admins/products",
        icon: FaProductHunt,
        slug: "product",
      },
    ],
  },
  {
    type: "collapse",
    label: "Pricing Master",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Pricing",
        path: "/sub-admins/pricing",
        icon: IoPricetags,
        slug: "pricing",
      },
      {
        
        label: "Pricing Category",
        path: "/sub-admins/pricing-category",
        icon: IoPricetags,
        slug: "pricing-category",
      }
      // {
      //   label: "Price Update",
      //   path: "/sub-admins/price-update",
      //   icon: IoPricetags,
      //   slug: "price-update",
      // },
    ],
  },
  // {
  //   type: "collapse",
  //   label: "Plant Master",
  //   icon: AiOutlineMenuUnfold,
  //   children: [
  //     {
  //       label: "Plant",
  //       path: "/sub-admins/plant",
  //       icon: FaRegBuilding,
  //       slug: "plant",
  //     },
  //   ],
  // },
  {
    type: "collapse",
    label: "Cancel Reason Master",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Reasons",
        path: "/sub-admins/reason-master",
        icon: IoIosAdd,
        slug: "reasons",
      },
    ],
  },
  {
    type: "collapse",
    label: "Distributor Master",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Distributer",
        path: "/sub-admins/distributer",
        icon: FaUsers,
        slug: "distributor",
      },
    ],
  },
  {
    type: "collapse",
    label: "Sales Hierarchy",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Designation",
        path: "/sub-admins/designation",
        icon: FaUsers,
        slug: "designation",
      },
      {
        label: "Employee",
        path: "/sub-admins/employee",
        icon: FaPerson,
        slug: "employee",
      },
    ],
  },
  {
    type: "collapse",
    label: "Route Master",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Beat",
        path: "/sub-admins/beat",
        icon: FaRoute,
        slug: "beat",
      },
      {
        label: "Beat Mapping",
        path: "/sub-admins/beat-mapping",
        icon: FaUsersGear,
        slug: "beat-mapping",
      },
    ],
  },
  // {
  //   type: "collapse",
  //   label: "Beat Mapping",
  //   icon: AiOutlineMenuUnfold,
  //   children: [
  //     {
  //       label: "Beat Mapping",
  //       path: "/sub-admins/beat-mapping",
  //       icon: FaUsersGear,
  //     },
  //   ],
  // },
  // {
  //   type: "collapse",
  //   label: "Lead Management",
  //   icon: AiOutlineMenuUnfold,
  //   children: [
  //     {
  //       label: "Lead Approval",
  //       path: "/sub-admins/outlet-requests",
  //       icon: FaCodePullRequest,
  //     },
  //   ],
  // },
  {
    type: "collapse",
    label: "Outlet Master",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Add Outlet",
        path: "/sub-admins/outlet-requests",
        icon: FaCodePullRequest,
        slug: "outlet-lead",
      },
      {
        label: "Outlet List",
        path: "/sub-admins/outlet-list",
        icon: FaCodePullRequest,
        slug: "outlet-list",
      },
      // {
      //   label: "Transfer/Copy",
      //   path: "/admin/outlet-transfer-copy",
      //   icon: FaCodePullRequest,
      // },
    ],
  },
  {
    type: "collapse",
    label: "Purchase",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Supplier Master",
        path: "/sub-admins/supplier-list",
        icon: FaListAlt,
        slug: "supplier-master",
      },

      // {
      //   label: "Purchase Order List",
      //   path: "/sub-admins/purchase-order-list",
      //   icon: FaList,
      //   slug:"purchase-order-list"
      // },
      {
        label: "Purchase Invoice Log",
        path: "/sub-admins/purchase-invoice-log",
        icon: FaList,
        slug: "purchase-invoice-log",
      },
      {
        label: "Purchase  Order Log",
        path: "/sub-admins/purchase-order-log",
        icon: FaList,
        slug: "purchase-order-log",
      },
      {
        label: "Purchase Return Log",
        path: "/sub-admins/purchase-return-log",
        icon: FaList,
        slug: "purchase-return-log",
      },
    ],
  },
  {
    type: "collapse",
    label: "Sales",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Sales Order Log",
        path: "/sub-admins/sales-order-log",
        icon: FaListAlt,
        slug: "sales-order-log",
      },
      {
        label: "DB Orders List",
        path: "/sub-admins/all-db-orders-list",
        icon: FaListAlt,
        slug: "db-orders-list",
      },
    ],
  },
  {
    type: "collapse",
    label: "Godown Master",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Add Godown",
        path: "/sub-admins/godown-add",
        icon: FaWarehouse,
      },
    ],
  },

  // {
  //   type: "collapse",
  //   label: "RBP App",
  //   icon: AiOutlineMenuUnfold,
  //   children: [
  //     // {
  //     //   label: "App Banner",
  //     //   path: "/sub-admins/rvp-app-banner",
  //     //   icon: PiFlagBannerFoldLight,
  //     // },
  //     // {
  //     //   label: "Gift Master",
  //     //   path: "/sub-admins/rbp-reward-products",
  //     //   icon: FaGift,
  //     // },
  //     // {
  //     //   label: "Terms & Conditions",
  //     //   path: "/sub-admins/rvp-terms-conditions",
  //     //   icon: MdChecklist,
  //     // },
  //     // {
  //     //   label: "Catalogue",
  //     //   path: "/sub-admins/rvp-catalogue",
  //     //   icon: MdChecklist,
  //     // },
  //     {
  //       label: "Multiplier Slab Config",
  //       path: "/sub-admins/multiplier-slab-config",
  //       icon: MdChecklist,
  //       slug: "multiplier-slab-config",
  //     },
  //     {
  //       label: "Multiplier Transactions",
  //       path: "/sub-admins/retailer-multiplier-transactions",
  //       icon: MdChecklist,
  //       slug: "multiplier-transactions",
  //     },
  //     {
  //       label: "Distributor Transactions",
  //       path: "/sub-admins/rbp-reward-transactions",
  //       icon: MdChecklist,
  //       slug: "distributor-transactions",
  //     },
  //     {
  //       label: "Retailer Transaction History",
  //       path: "/sub-admins/retailer-transaction-history",
  //       icon: MdChecklist,
  //       slug: "retailer-transaction-history",
  //     },
  //     {
  //       label: "Reward Products",
  //       path: "/sub-admins/rbp-reward-products",
  //       icon: FaGift,
  //       slug: "reward-products",
  //     },
  //     {
  //       label: "RBP Catalogue",
  //       path: "/sub-admins/rbp-catalogue",
  //       icon: GrCatalogOption,
  //       slug: "rbp-catalogue",
  //     },
  //     {
  //       label: "RBP Banner",
  //       path: "/sub-admins/rbp-banner",
  //       icon: GiTatteredBanner,
  //       slug: "rbp-banner",
  //     },
  //     {
  //       label: "Terms & Conditions",
  //       path: "/sub-admins/rvp-terms-conditions",
  //       icon: MdChecklist,
  //       slug: "terms-and-conditions",
  //     },
  //     {
  //       label: "Retailer Orders",
  //       path: "/sub-admins/retailer-orders",
  //       icon: LiaBorderStyleSolid,
  //       slug: "retailer-orders",
  //     },
  //     {
  //       label: "App Versions",
  //       path: "/sub-admins/app-versions",
  //       icon: FaMobileAlt,
  //     },
  //   ],
  // },

  {
    type: "collapse",
    label: "Settings & Configs",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Settings & Configs",
        path: "/sub-admins/settings",
        icon: CiSettings,
        slug: "settings-configs",
      },
    ],
  },
  // {
  //   type: "collapse",
  //   label: "Target VS  Achievement",
  //   icon: AiOutlineMenuUnfold,
  //   children: [
  //     {
  //       label: "Primary Slab Setting ",
  //       path: "/sub-admins/primary-slab",
  //       icon: CiSettings,
  //       slug: "primary-slab-setting",
  //     },

  //     {
  //       label: "Primary Target VS Achievement Setting",
  //       path: "/sub-admins/primary-target-setting",
  //       icon: CiSettings,
  //       slug: "primary-target-vs-achievement-setting",
  //     },

  //     {
  //       label: "Secondary Slab Setting",
  //       path: "/sub-admins/secondary-slab",
  //       icon: CiSettings,
  //       slug: "secondary-slab-setting",
  //     },
  //     {
  //       label: "Secondary Target VS Achievement Setting",
  //       path: "/sub-admins/secondary-target",
  //       icon: CiSettings,
  //       slug: "secondary-target-vs-achievement-setting",
  //     },
  //   ],
  // },
  //   {
  //   type: "collapse",
  //   label: "User Management",
  //   icon: AiOutlineMenuUnfold,
  //   children: [
  //     {
  //       label: "User Management",
  //       path: "/sub-admins/user-management",
  //       icon: FaUsers,
  //     },
  //   ],
  // },

  {
    type: "item",
    label: "Image Converter",
    path: "/sub-admins/image-converter",
    icon: IoIosImages,
    slug: "image-converter",
  },
  {
    type: "item",
    label: "HelpDesk",
    path: "/sub-admins/view-helpdesk",
    icon: MdChecklist,
    slug: "helpdesk",
  },
  {
    type: "item",
    label: "Announcements",
    path: "/sub-admins/announcements",
    icon: TbMicrophone2,
  },
  {
    type: "item",
    label: "Logout",
    path: "/logout",
    icon: FaSignOutAlt,
    isLogout: true,
  },
];

// THIS is for admin Sidebar config  ///////////////////////////////////////////////////////////////////////////////////////////////////

export const aaadminsesidebarconfig = [
  {
    type: "item",
    label: "Dashboard",
    path: "/admine/dashboard",
    icon: AiFillDashboard,
  },
  {
    type: "collapse",
    label: "Reports",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Stock Report",
        path: "/admine/stock-report",
        icon: LuBookDown,
        slug: "stock-report",
      },
      {
        label: "Distributor Inventory Report",
        path: "/admine/distributor-inventory-report",
        icon: LuBookDown,
        slug: "distributor-inventory-report",
      },
      {
        label: "Stock Ledger ",
        path: "/admine/stock-report-ledger",
        icon: LuBookDown,
        slug: "stock-ledger",
      },
      {
        label: "Purchase Order Report",
        path: "/admine/purchase-order-report",
        icon: LuBookDown,
        slug: "purchase-order-report",
      },
      {
        label: "Primary Invoice Report",
        path: "/admine/primary-invoice-report",
        icon: LuBookDown,
        slug: "primary-invoice-report",
      },
      {
        label: "Sales Order Report",
        path: "/admine/order-report",
        icon: LuBookDown,
        slug: "sales-order-report",
      },
      {
        label: "Sales Bill Report",
        path: "/admine/sales-bill-report",
        icon: LuBookDown,
        slug: "sales-bill-report",
      },
      {
        label: "Order vs Bill Report",
        path: "/admine/order-to-bill-report",
        icon: LuBookDown,
        slug: "order-vs-bill-report",
      },

      {
        label: "Sales Return Report",
        path: "/admine/sales-return-report",
        icon: LuBookDown,
        slug: "sales-return-report",
      },
      {
        label: "Distributor RBP Ledger",
        path: "/admine/distributor-rbp-ledger",
        icon: LuBookDown,
        slug: "distributor-rbp-ledger",
      },
      {
        label: "Retailer RBP Ledger",
        path: "/admine/retailer-rbp-ledger",
        icon: LuBookDown,
        slug: "retailer-rbp-ledger",
      },
      {
        label: "Usage Report",
        path: "/admine/usage-report",
        icon: LuBookDown,
        slug: "usage-report",
      },

      // {
      //   label: "Stock Adjustment Report",
      //   path: "/admine/stock-adjustment-report",
      //   icon: LuBookDown,
      // },

      // {
      //   label: "Collection Report",
      //   path: "/admine/collection-report",
      //   icon: LuBookDown,
      // },
    ],
  },
  {
    type: "collapse",
    label: "Geo Hierarchy",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Zone",
        path: "/admine/zone",
        icon: BiSolidCategory,
        slug: "zone",
      },
      {
        label: "State",
        path: "/admine/state",
        icon: FaLayerGroup,
        slug: "state",
      },
      {
        label: "Region",
        path: "/admine/region",
        icon: BsCollectionFill,
        slug: "region",
      },
      {
        label: "District",
        path: "/admine/district",
        icon: BsCollectionFill,
        slug: "district",
      },
      {
        label: "Zone",
        path: "/admine/sub-division",
        icon: BsCollectionFill,
        slug: "sub-division",
      },
    ],
  },
  {
    type: "collapse",
    label: "Product Master",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Brand",
        path: "/admine/brand",
        icon: MdVerifiedUser,
        slug: "brand",
      },
      {
        label: "Sub-Brand",
        path: "/admine/sub-brand",
        icon: BiDisc,
        slug: "sub-brand",
      },
      {
        label: "Category",
        path: "/admine/category",
        icon: BiSolidCategory,
        slug: "category",
      },
      {
        label: "Collection",
        path: "/admine/collection",
        icon: BsCollectionFill,
        slug: "collection",
      },
      {
        label: "Product",
        path: "/admine/products",
        icon: FaProductHunt,
        slug: "product",
      },
    ],
  },
  {
    type: "collapse",
    label: "Pricing Master",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Pricing",
        path: "/admine/pricing",
        icon: IoPricetags,
        slug: "pricing",
      },
      {
        
        label: "Pricing Category",
        path: "/admine/pricing-category",
        icon: IoPricetags,
        slug: "pricing-category",
      }
      // {
      //   label: "Price Update",
      //   path: "/admine/price-update",
      //   icon: IoPricetags,
      //   slug: "price-update",
      // },
    ],
  },
  // {
  //   type: "collapse",
  //   label: "Plant Master",
  //   icon: AiOutlineMenuUnfold,
  //   children: [
  //     {
  //       label: "Plant",
  //       path: "/admine/plant",
  //       icon: FaRegBuilding,
  //       slug: "plant",
  //     },
  //   ],
  // },
  {
    type: "collapse",
    label: "Cancel Reason Master",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Reasons",
        path: "/admine/reason-master",
        icon: IoIosAdd,
        slug: "reasons",
      },
    ],
  },
  {
    type: "collapse",
    label: "Distributor Master",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Distributer",
        path: "/admine/distributer",
        icon: FaUsers,
        slug: "distributor",
      },
    ],
  },
  {
    type: "collapse",
    label: "Sales Hierarchy",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Designation",
        path: "/admine/designation",
        icon: FaUsers,
        slug: "designation",
      },
      {
        label: "Employee",
        path: "/admine/employee",
        icon: FaPerson,
        slug: "employee",
      },
    ],
  },
  {
    type: "collapse",
    label: "Route Master",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Beat",
        path: "/admine/beat",
        icon: FaRoute,
        slug: "beat",
      },
      {
        label: "Beat Mapping",
        path: "/admine/beat-mapping",
        icon: FaUsersGear,
        slug: "beat-mapping",
      },
    ],
  },
  // {
  //   type: "collapse",
  //   label: "Beat Mapping",
  //   icon: AiOutlineMenuUnfold,
  //   children: [
  //     {
  //       label: "Beat Mapping",
  //       path: "/admine/beat-mapping",
  //       icon: FaUsersGear,
  //     },
  //   ],
  // },
  // {
  //   type: "collapse",
  //   label: "Lead Management",
  //   icon: AiOutlineMenuUnfold,
  //   children: [
  //     {
  //       label: "Lead Approval",
  //       path: "/admine/outlet-requests",
  //       icon: FaCodePullRequest,
  //     },
  //   ],
  // },
  {
    type: "collapse",
    label: "Outlet Master",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Add Outlet",
        path: "/admine/outlet-requests",
        icon: FaCodePullRequest,
        slug: "outlet-lead",
      },
      {
        label: "Outlet List",
        path: "/admine/outlet-list",
        icon: FaCodePullRequest,
        slug: "outlet-list",
      },
      // {
      //   label: "Transfer/Copy",
      //   path: "/admin/outlet-transfer-copy",
      //   icon: FaCodePullRequest,
      // },
    ],
  },
  {
    type: "collapse",
    label: "Purchase",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Supplier Master",
        path: "/admine/supplier-list",
        icon: FaListAlt,
        slug: "supplier-master",
      },

      // {
      //   label: "Purchase Order List",
      //   path: "/admin2/purchase-order-list",
      //   icon: FaList,
      //   slug:"purchase-order-list"
      // },
      {
        label: "Purchase Invoice Log",
        path: "/admine/purchase-invoice-log",
        icon: FaList,
        slug: "purchase-invoice-log",
      },
      {
        label: "Purchase  Order Log",
        path: "/admine/purchase-order-log",
        icon: FaList,
        slug: "purchase-order-log",
      },
      {
        label: "Purchase Return Log",
        path: "/admine/purchase-return-log",
        icon: FaList,
        slug: "purchase-return-log",
      },
    ],
  },
  {
    type: "collapse",
    label: "Sales",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Sales Order Log",
        path: "/admine/sales-order-log",
        icon: FaListAlt,
        slug: "sales-order-log",
      },
      {
        label: "DB Orders List",
        path: "/admine/all-db-orders-list",
        icon: FaListAlt,
        slug: "db-orders-list",
      },
    ],
  },
  {
    type: "collapse",
    label: "Godown Master",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Add Godown",
        path: "/admine/godown-add",
        icon: FaWarehouse,
      },
    ],
  },

  // {
  //   type: "collapse",
  //   label: "RBP App",
  //   icon: AiOutlineMenuUnfold,
  //   children: [
  //     // {
  //     //   label: "App Banner",
  //     //   path: "/admine/rvp-app-banner",
  //     //   icon: PiFlagBannerFoldLight,
  //     // },
  //     // {
  //     //   label: "Gift Master",
  //     //   path: "/admine/rbp-reward-products",
  //     //   icon: FaGift,
  //     // },
  //     // {
  //     //   label: "Terms & Conditions",
  //     //   path: "/admine/rbp-terms-conditions",
  //     //   icon: MdChecklist,
  //     // },
  //     // {
  //     //   label: "Catalogue",
  //     //   path: "/admine/rbp-catalogue",
  //     //   icon: MdChecklist,
  //     // },
  //     {
  //       label: "Multiplier Slab Config",
  //       path: "/admine/retailer-multiplier-slab-config",
  //       icon: MdChecklist,
  //       slug: "multiplier-slab-config",
  //     },
  //     {
  //       label: "Multiplier Transactions",
  //       path: "/admine/retailer-multiplier-transactions",
  //       icon: MdChecklist,
  //       slug: "multiplier-transactions",
  //     },
  //     {
  //       label: "Distributor Transactions",
  //       path: "/admine/rbp-reward-transactions",
  //       icon: MdChecklist,
  //       slug: "distributor-transactions",
  //     },

  //     {
  //       label: "Retailer Transaction History",
  //       path: "/admine/retailer-transaction-history",
  //       icon: MdChecklist,
  //       slug: "retailer-transaction-history",
  //     },
  //     {
  //       label: "Reward Products",
  //       path: "/admine/rbp-reward-products",
  //       icon: FaGift,
  //       slug: "reward-products",
  //     },
  //     {
  //       label: "RBP Catalogue",
  //       path: "/admine/rbp-catalogue",
  //       icon: GrCatalogOption,
  //       slug: "rbp-catalogue",
  //     },
  //     {
  //       label: "RBP Banner",
  //       path: "/admine/rbp-banner",
  //       icon: GiTatteredBanner,
  //       slug: "rbp-banner",
  //     },
  //     {
  //       label: "Terms & Conditions",
  //       path: "/admine/rbp-terms-conditions",
  //       icon: MdChecklist,
  //       slug: "terms-and-conditions",
  //     },
  //     {
  //       label: "Retailer Orders",
  //       path: "/admine/retailer-orders",
  //       icon: LiaBorderStyleSolid,
  //       slug: "retailer-orders",
  //     },
  //     {
  //       label: "App Versions",
  //       path: "/admine/app-versions",
  //       icon: FaMobileAlt,
  //     },
  //   ],
  // },

  {
    type: "collapse",
    label: "Settings & Configs",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Settings & Configs",
        path: "/admine/settings",
        icon: CiSettings,
        slug: "settings-configs",
      },
    ],
  },
  // {
  //   type: "collapse",
  //   label: "Target VS  Achievement",
  //   icon: AiOutlineMenuUnfold,
  //   children: [
  //     {
  //       label: "Primary Slab Setting ",
  //       path: "/admine/primary-slab",
  //       icon: CiSettings,
  //       slug: "primary-slab-setting",
  //     },

  //     {
  //       label: "Primary Target VS Achievement Setting",
  //       path: "/admine/primary-target-setting",
  //       icon: CiSettings,
  //       slug: "primary-target-vs-achievement-setting",
  //     },

  //     {
  //       label: "Secondary Slab Setting",
  //       path: "/admine/secondary-slab",
  //       icon: CiSettings,
  //       slug: "secondary-slab-setting",
  //     },
  //     {
  //       label: "Secondary Target VS Achievement Setting",
  //       path: "/admine/secondary-target",
  //       icon: CiSettings,
  //       slug: "secondary-target-vs-achievement-setting",
  //     },
  //   ],
  // },
  //   {
  //   type: "collapse",
  //   label: "User Management",
  //   icon: AiOutlineMenuUnfold,
  //   children: [
  //     {
  //       label: "User Management",
  //       path: "/admine/user-management",
  //       icon: FaUsers,
  //     },
  //   ],
  // },

  {
    type: "item",
    label: "Image Converter",
    path: "/admine/image-converter",
    icon: IoIosImages,
    slug: "image-converter",
  },
  {
    type: "item",
    label: "HelpDesk",
    path: "/admine/view-helpdesk",
    icon: MdChecklist,
    slug: "helpdesk",
  },
  {
    type: "item",
    label: "Announcements",
    path: "/admine/announcements",
    icon: TbMicrophone2,
  },
  {
    type: "item",
    label: "Logout",
    path: "/logout",
    icon: FaSignOutAlt,
    isLogout: true,
  },
];

//This is  Sales sidebarconfig //////////////////////////////////////////////////////////////////////////////////////////////////////

export const salessidebarconfig = [
  {
    type: "item",
    label: "Dashboard",
    path: "/sales/dashboard",
    icon: AiFillDashboard,
  },
  {
    type: "collapse",
    label: "Reports",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Stock Report",
        path: "/sales/stock-report",
        icon: LuBookDown,
        slug: "stock-report",
      },
      {
        label: "Distributor Inventory Report",
        path: "/sales/distributor-inventory-report",
        icon: LuBookDown,
        slug: "distributor-inventory-report",
      },
      {
        label: "Stock Ledger ",
        path: "/sales/stock-report-ledger",
        icon: LuBookDown,
        slug: "stock-ledger",
      },
      {
        label: "Purchase Order Report",
        path: "/sales/purchase-order-report",
        icon: LuBookDown,
        slug: "purchase-order-report",
      },
      {
        label: "Primary Invoice Report",
        path: "/sales/primary-invoice-report",
        icon: LuBookDown,
        slug: "primary-invoice-report",
      },
      {
        label: "Sales Order Report",
        path: "/sales/order-report",
        icon: LuBookDown,
        slug: "sales-order-report",
      },
      {
        label: "Sales Bill Report",
        path: "/sales/sales-bill-report",
        icon: LuBookDown,
        slug: "sales-bill-report",
      },
      {
        label: "Order vs Bill Report",
        path: "/sales/Order-to-bill-report",
        icon: LuBookDown,
        slug: "order-vs-bill-report",
      },

      {
        label: "Sales Return Report",
        path: "/sales/sales-return-report",
        icon: LuBookDown,
        slug: "sales-return-report",
      },
      {
        label: "Distributor RBP Ledger",
        path: "/sales/distributor-rbp-ledger",
        icon: LuBookDown,
        slug: "distributor-rbp-ledger",
      },
      {
        label: "Retailer RBP Ledger",
        path: "/sales/retailer-rbp-ledger",
        icon: LuBookDown,
        slug: "retailer-rbp-ledger",
      },
      {
        label: "Usage Report",
        path: "/sales/usage-report",
        icon: LuBookDown,
        slug: "usage-report",
      },

      // {
      //   label: "Stock Adjustment Report",
      //   path: "/sales/stock-adjustment-report",
      //   icon: LuBookDown,
      // },

      // {
      //   label: "Collection Report",
      //   path: "/sales/collection-report",
      //   icon: LuBookDown,
      // },
    ],
  },
  {
    type: "collapse",
    label: "Geo Hierarchy",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Zone",
        path: "/sales/zone",
        icon: BiSolidCategory,
        slug: "zone",
      },
      {
        label: "State",
        path: "/sales/state",
        icon: FaLayerGroup,
        slug: "state",
      },
      {
        label: "Region",
        path: "/sales/region",
        icon: BsCollectionFill,
        slug: "region",
      },
      {
        label: "District",
        path: "/sales/district",
        icon: BsCollectionFill,
        slug: "district",
      },
      {
        label: "Zone",
        path: "/sales/sub-division",
        icon: BsCollectionFill,
        slug: "sub-division",
      },
    ],
  },
  {
    type: "collapse",
    label: "Product Master",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Brand",
        path: "/sales/brand",
        icon: MdVerifiedUser,
        slug: "brand",
      },
      {
        label: "Sub-Brand",
        path: "/sales/sub-brand",
        icon: BiDisc,
        slug: "sub-brand",
      },
      {
        label: "Category",
        path: "/sales/category",
        icon: BiSolidCategory,
        slug: "category",
      },
      {
        label: "Collection",
        path: "/sales/collection",
        icon: BsCollectionFill,
        slug: "collection",
      },
      {
        label: "Product",
        path: "/sales/products",
        icon: FaProductHunt,
        slug: "product",
      },
    ],
  },
  {
    type: "collapse",
    label: "Pricing Master",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Pricing",
        path: "/sales/pricing",
        icon: IoPricetags,
        slug: "pricing",
      },
      {
        
        label: "Pricing Category",
        path: "/sales/pricing-category",
        icon: IoPricetags,
        slug: "pricing-category",
      }
      // {
      //   label: "Price Update",
      //   path: "/sales/price-update",
      //   icon: IoPricetags,
      //   slug: "price-update",
      // },
    ],
  },
  {
    type: "collapse",
    label: "Plant Master",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Plant",
        path: "/sales/plant",
        icon: FaRegBuilding,
        slug: "plant",
      },
    ],
  },
  {
    type: "collapse",
    label: "Cancel Reason Master",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Reasons",
        path: "/sales/reason-master",
        icon: IoIosAdd,
        slug: "reasons",
      },
    ],
  },
  {
    type: "collapse",
    label: "Distributor Master",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Distributer",
        path: "/sales/distributer",
        icon: FaUsers,
        slug: "distributor",
      },
    ],
  },
  {
    type: "collapse",
    label: "Sales Hierarchy",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Designation",
        path: "/sales/designation",
        icon: FaUsers,
        slug: "designation",
      },
      {
        label: "Employee",
        path: "/sales/employee",
        icon: FaPerson,
        slug: "employee",
      },
    ],
  },
  {
    type: "collapse",
    label: "Route Master",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Beat",
        path: "/sales/beat",
        icon: FaRoute,
        slug: "beat",
      },
      {
        label: "Beat Mapping",
        path: "/sales/beat-mapping",
        icon: FaUsersGear,
        slug: "beat-mapping",
      },
    ],
  },
  // {
  //   type: "collapse",
  //   label: "Beat Mapping",
  //   icon: AiOutlineMenuUnfold,
  //   children: [
  //     {
  //       label: "Beat Mapping",
  //       path: "/sales/beat-mapping",
  //       icon: FaUsersGear,
  //     },
  //   ],
  // },
  // {
  //   type: "collapse",
  //   label: "Lead Management",
  //   icon: AiOutlineMenuUnfold,
  //   children: [
  //     {
  //       label: "Lead Approval",
  //       path: "/sales/outlet-requests",
  //       icon: FaCodePullRequest,
  //     },
  //   ],
  // },
  {
    type: "collapse",
    label: "Outlet Master",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Add Outlet",
        path: "/sales/outlet-requests",
        icon: FaCodePullRequest,
        slug: "outlet-lead",
      },
      {
        label: "Outlet List",
        path: "/sales/outlet-list",
        icon: FaCodePullRequest,
        slug: "outlet-list",
      },
      // {
      //   label: "Transfer/Copy",
      //   path: "/admin/outlet-transfer-copy",
      //   icon: FaCodePullRequest,
      // },
    ],
  },
  {
    type: "collapse",
    label: "Purchase",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Supplier Master",
        path: "/sales/supplier-list",
        icon: FaListAlt,
        slug: "supplier-master",
      },

      // {
      //   label: "Purchase Order List",
      //   path: "/user/purchase-order-list",
      //   icon: FaList,
      //   slug:"purchase-order-list"
      // },
      {
        label: "Purchase Invoice Log",
        path: "/Sales/purchase-invoice-log",
        icon: FaList,
        slug: "purchase-invoice-log",
      },
      {
        label: "Purchase  Order Log",
        path: "/Sales/purchase-order-log",
        icon: FaList,
        slug: "purchase-order-log",
      },
      {
        label: "Purchase Return Log",
        path: "/Sales/purchase-return-log",
        icon: FaList,
        slug: "purchase-return-log",
      },
    ],
  },
  {
    type: "collapse",
    label: "Sales",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Sales Order Log",
        path: "/Sales/sales-order-log",
        icon: FaListAlt,
        slug: "sales-order-log",
      },
      {
        label: "DB Orders List",
        path: "/Sales/all-db-orders-list",
        icon: FaListAlt,
        slug: "db-orders-list",
      },
    ],
  },
  {
    type: "collapse",
    label: "Godown Master",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Add Godown",
        path: "/sales/godown-add",
        icon: FaWarehouse,
      },
    ],
  },
  // {
  //   type: "collapse",
  //   label: "RBP App",
  //   icon: AiOutlineMenuUnfold,
  //   children: [
  //     // {
  //     //   label: "App Banner",
  //     //   path: "/Sales/rvp-app-banner",
  //     //   icon: PiFlagBannerFoldLight,
  //     // },
  //     // {
  //     //   label: "Gift Master",
  //     //   path: "/Sales/rbp-reward-products",
  //     //   icon: FaGift,
  //     // },
  //     // {
  //     //   label: "Terms & Conditions",
  //     //   path: "/Sales/rvp-terms-conditions",
  //     //   icon: MdChecklist,
  //     // },
  //     // {
  //     //   label: "Catalogue",
  //     //   path: "/Sales/rvp-catalogue",
  //     //   icon: MdChecklist,
  //     // },
  //     {
  //       label: "Multiplier Slab Config",
  //       path: "/Sales/retailer-multiplier-slab-config",
  //       icon: MdChecklist,
  //       slug: "multiplier-slab-config",
  //     },
  //     {
  //       label: "Multiplier Transactions",
  //       path: "/Sales/retailer-multiplier-transactions",
  //       icon: MdChecklist,
  //       slug: "multiplier-transactions",
  //     },
  //     {
  //       label: "Distributor Transactions",
  //       path: "/Sales/rbp-reward-transactions",
  //       icon: MdChecklist,
  //       slug: "distributor-transactions",
  //     },
  //     {
  //       label: "Retailer Transaction History",
  //       path: "/Sales/retailer-transaction-history",
  //       icon: MdChecklist,
  //       slug: "retailer-transaction-history",
  //     },
  //     {
  //       label: "Reward Products",
  //       path: "/Sales/rbp-reward-products",
  //       icon: FaGift,
  //       slug: "reward-products",
  //     },
  //     {
  //       label: "RBP Catalogue",
  //       path: "/Sales/rbp-catalogue",
  //       icon: GrCatalogOption,
  //       slug: "rbp-catalogue",
  //     },
  //     {
  //       label: "RBP Banner",
  //       path: "/Sales/rbp-banner",
  //       icon: GiTatteredBanner,
  //       slug: "rbp-banner",
  //     },
  //     {
  //       label: "Terms & Conditions",
  //       path: "/Sales/rbp-terms-conditions",
  //       icon: MdChecklist,
  //       slug: "terms-and-conditions",
  //     },
  //     {
  //       label: "Retailer Orders",
  //       path: "/Sales/retailer-orders",
  //       icon: LiaBorderStyleSolid,
  //       slug: "retailer-orders",
  //     },
  //     {
  //       label: "App Versions",
  //       path: "/Sales/app-versions",
  //       icon: FaMobileAlt,
  //     },
  //   ],
  // },
  {
    type: "collapse",
    label: "Settings & Configs",
    icon: AiOutlineMenuUnfold,
    children: [
      {
        label: "Settings & Configs",
        path: "/Sales/settings",
        icon: CiSettings,
        slug: "settings-configs",
      },
    ],
  },
  // {
  //   type: "collapse",
  //   label: "Target VS  Achievement",
  //   icon: AiOutlineMenuUnfold,
  //   children: [
  //     {
  //       label: "Primary Slab Setting ",
  //       path: "/Sales/primary-slab",
  //       icon: CiSettings,
  //       slug: "primary-slab-setting",
  //     },

  //     {
  //       label: "Primary Target VS Achievement Setting",
  //       path: "/Sales/primary-target-setting",
  //       icon: CiSettings,
  //       slug: "primary-target-vs-achievement-setting",
  //     },

  //     {
  //       label: "Secondary Slab Setting",
  //       path: "/Sales/secondary-slab",
  //       icon: CiSettings,
  //       slug: "secondary-slab-setting",
  //     },
  //     {
  //       label: "Secondary Target VS Achievement Setting",
  //       path: "/Sales/secondary-target",
  //       icon: CiSettings,
  //       slug: "secondary-target-vs-achievement-setting",
  //     },
  //   ],
  // },
  //   {
  //   type: "collapse",
  //   label: "User Management",
  //   icon: AiOutlineMenuUnfold,
  //   children: [
  //     {
  //       label: "User Management",
  //       path: "/Sales/user-management",
  //       icon: FaUsers,
  //     },
  //   ],
  // },

  {
    type: "item",
    label: "Image Converter",
    path: "/Sales/image-converter",
    icon: IoIosImages,
    slug: "image-converter",
  },
  {
    type: "item",
    label: "HelpDesk",
    path: "/Sales/view-helpdesk",
    icon: MdChecklist,
    slug: "helpdesk",
  },
  {
    type: "item",
    label: "Announcements",
    path: "/Sales/announcements",
    icon: TbMicrophone2,
  },
  {
    type: "item",
    label: "Logout",
    path: "/logout",
    icon: FaSignOutAlt,
    isLogout: true,
  },
];

//  subAdminPrimarySidebarConfig //////////////////////////////////////////////////////////////////////////////////////////////////////

// export const subAdminPrimarySidebarConfig = [
//   // {
//   //   type: "item",
//   //   label: "Dashboard",
//   //   path: "/admin/dashboard",
//   //   icon: AiFillDashboard,
//   // },
//   {
//     type: "collapse",
//     label: "Reports",
//     icon: AiOutlineMenuUnfold,
//     children: [
//       {
//         label: "Purchase Order Report",
//         path: "/sub-admin/purchase-order-report",
//         icon: LuBookDown,
//       },
//       {
//         label: "Primary Invoice Report",
//         path: "/sub-admin/primary-invoice-report",
//         icon: LuBookDown,
//       },
//       {
//         label: "Stock Report",
//         path: "/sub-admin/stock-report",
//         icon: LuBookDown,
//       },
//       // {
//       //   label: "Stock Adjustment Report",
//       //   path: "/admin/stock-adjustment-report",
//       //   icon: LuBookDown,
//       // },
//       {
//         label: "Sales Order Report",
//         path: "/sub-admin/order-report",
//         icon: LuBookDown,
//       },
//       {
//         label: "Order vs Bill Report",
//         path: "/sub-admin/order-to-bill-report",
//         icon: LuBookDown,
//       },
//       {
//         label: "Sales Bill Report",
//         path: "/sub-admin/sales-bill-report",
//         icon: LuBookDown,
//       },
//       {
//         label: "Sales Return Report",
//         path: "/sub-admin/sales-return-report",
//         icon: LuBookDown,
//       },
//       // {
//       //   label: "Collection Report",
//       //   path: "/sub-admin-primary/collection-report",
//       //   icon: LuBookDown,
//       // },
//       {
//         label: "Distributor RBP Ledger",
//         path: "/sub-admin/distributor-rbp-ledger",
//         icon: LuBookDown,
//       },
//       {
//         label: "Retailer RBP Ledger",
//         path: "/sub-admin/retailer-rbp-ledger",
//         icon: LuBookDown,
//       },
//       {
//         label: "Distributor Inventory Report",
//         path: "/sub-admin/distributor-inventory-report",
//         icon: LuBookDown,
//       },
//     ],
//   },
//   {
//     type: "collapse",
//     label: "Geo Hierarchy",
//     icon: AiOutlineMenuUnfold,
//     children: [
//       {
//         label: "Zone",
//         path: "/sub-admin/zone",
//         icon: BiSolidCategory,
//       },
//       {
//         label: "State",
//         path: "/sub-admin/state",
//         icon: FaLayerGroup,
//       },
//       {
//         label: "Region",
//         path: "/sub-admin/region",
//         icon: BsCollectionFill,
//       },
//     ],
//   },
//   {
//     type: "collapse",
//     label: "Product Master",
//     icon: AiOutlineMenuUnfold,
//     children: [
//       {
//         label: "Brand",
//         path: "/sub-admin/brand",
//         icon: MdVerifiedUser,
//       },
//       {
//         label: "Sub-Brand",
//         path: "/sub-admin/sub-brand",
//         icon: BiDisc,
//       },
//       {
//         label: "Category",
//         path: "/sub-admin/category",
//         icon: BiSolidCategory,
//       },
//       {
//         label: "Collection",
//         path: "/sub-admin/collection",
//         icon: BsCollectionFill,
//       },
//       {
//         label: "Product",
//         path: "/sub-admin/products",
//         icon: FaProductHunt,
//       },
//     ],
//   },
//   {
//     type: "collapse",
//     label: "Pricing Master",
//     icon: AiOutlineMenuUnfold,
//     children: [
//       {
//         label: "Pricing",
//         path: "/sub-admin/pricing",
//         icon: IoPricetags,
//       },


//       {
//         label: "Price Update",
//         path: "/sub-admin/price-update",
//         icon: IoPricetags,
//       },
//     ],
//   },
//   {
//     type: "collapse",
//     label: "Distributor Master",
//     icon: AiOutlineMenuUnfold,
//     children: [
//       {
//         label: "Distributer",
//         path: "/sub-admin/distributer",
//         icon: FaUsers,
//       },
//     ],
//   },
//   {
//     type: "collapse",
//     label: "Sales Hierarchy",
//     icon: AiOutlineMenuUnfold,
//     children: [
//       {
//         label: "Designation",
//         path: "/sub-admin/designation",
//         icon: FaUsers,
//       },
//       {
//         label: "Employee",
//         path: "/sub-admin/employee",
//         icon: FaPerson,
//       },
//     ],
//   },
//   {
//     type: "collapse",
//     label: "Route Master",
//     icon: AiOutlineMenuUnfold,
//     children: [
//       {
//         label: "Beat",
//         path: "/sub-admin/beat",
//         icon: FaRoute,
//       },
//       {
//         label: "Beat Mapping",
//         path: "/sub-admin/beat-mapping",
//         icon: FaUsersGear,
//       },
//     ],
//   },
//   {
//     type: "collapse",
//     label: "Plant Master",
//     icon: AiOutlineMenuUnfold,
//     children: [
//       {
//         label: "Plant",
//         path: "/sub-admin/plant",
//         icon: FaRegBuilding,
//       },
//     ],
//   },
//   {
//     type: "collapse",
//     label: "Outlet Master",
//     icon: AiOutlineMenuUnfold,
//     children: [
//       {
//         label: "Outlet List",
//         path: "/sub-admin/outlet-list",
//         icon: FaCodePullRequest,
//       },
//     ],
//   },
//   {
//     type: "collapse",
//     label: "Reason Master",
//     icon: AiOutlineMenuUnfold,
//     children: [
//       {
//         label: "Reasons",
//         path: "/sub-admin/reason-master",
//         icon: IoIosAdd,
//       },
//     ],
//   },
//   {
//     type: "collapse",
//     label: "Purchase",
//     icon: AiOutlineMenuUnfold,
//     children: [
//       {
//         label: "Supplier Master",
//         path: "/sub-admin/supplier-list",
//         icon: FaListAlt,
//       },

//       {
//         label: "Purchase Invoice Log",
//         path: "/sub-admin/purchase-invoice-log",
//         icon: FaList,
//       },
//       {
//         label: "Purchase  Order Log",
//         path: "/sub-admin/purchase-order-log",
//         icon: FaList,
//       },
//     ],
//   },
//   {
//     type: "collapse",
//     label: "Sales",
//     icon: AiOutlineMenuUnfold,
//     children: [
//       {
//         label: "Sales Order Log",
//         path: "/sub-admin/sales-order-log",
//         icon: FaListAlt,
//       },
//     ],
//   },
//   {
//     type: "collapse",
//     label: "RBP App",
//     icon: AiOutlineMenuUnfold,
//     children: [
//       // {
//       //   label: "App Banner",
//       //   path: "/sub-admin/rvp-app-banner",
//       //   icon: PiFlagBannerFoldLight,
//       // },
//       // {
//       //   label: "Gift Master",
//       //   path: "/sub-admin/rbp-reward-products",
//       //   icon: FaGift,
//       // },
//       // {
//       //   label: "Terms & Conditions",
//       //   path: "/sub-admin/rvp-terms-conditions",
//       //   icon: MdChecklist,
//       // },
//       // {
//       //   label: "Catalogue",
//       //   path: "/sub-admin/rvp-catalogue",
//       //   icon: MdChecklist,
//       // },
//       {
//         label: "Multiplier Slab Config",
//         path: "/sub-admin/multiplier-slab-config",
//         icon: MdChecklist,
//       },
//       {
//         label: "Reward Transactions",
//         path: "/sub-admin/reward-transactions",
//         icon: MdChecklist,
//       },
//       {
//         label: "Multiplier Transactions",
//         path: "/sub-admin/multiplier-transactions",
//         icon: MdChecklist,
//       },
//     ],
//   },
//   // {
//   //   type: "collapse",
//   //   label: "Settings & Configs",
//   //   icon: AiOutlineMenuUnfold,
//   //   children: [
//   //     {
//   //       label: "Settings & Configs",
//   //       path: "/admin/settings",
//   //       icon: CiSettings,
//   //     },
//   //   ],
//   // },
//   // {
//   //   type: "collapse",
//   //   label: "Target Setting",
//   //   icon: AiOutlineMenuUnfold,
//   //   children: [
//   //     {
//   //       label: "Primary Target Setting",
//   //       path: "/admin/primary-target-setting",
//   //       icon: CiSettings,
//   //     },
//   //   ],
//   // },
//   // {
//   //   type: "item",
//   //   label: "HelpDesk",
//   //   path: "/admin/view-helpdesk",
//   //   icon: MdChecklist,
//   // },
//   {
//     type: "item",
//     label: "Logout",
//     path: "/logout",
//     icon: FaSignOutAlt,
//     isLogout: true,
//   },
// ];

// export const subAdminRBPSidebarConfig = [
//   // {
//   //   type: "item",
//   //   label: "Dashboard",
//   //   path: "/admin/dashboard",
//   //   icon: AiFillDashboard,
//   // },
//   {
//     type: "collapse",
//     label: "Reports",
//     icon: AiOutlineMenuUnfold,
//     children: [
//       {
//         label: "Purchase Order Report",
//         path: "/sub-admin/purchase-order-report",
//         icon: LuBookDown,
//       },
//       {
//         label: "Primary Invoice Report",
//         path: "/sub-admin/primary-invoice-report",
//         icon: LuBookDown,
//       },
//       {
//         label: "Stock Report",
//         path: "/sub-admin/stock-report",
//         icon: LuBookDown,
//       },
//       // {
//       //   label: "Stock Adjustment Report",
//       //   path: "/admin/stock-adjustment-report",
//       //   icon: LuBookDown,
//       // },
//       {
//         label: "Sales Order Report",
//         path: "/sub-admin/order-report",
//         icon: LuBookDown,
//       },
//       {
//         label: "Order vs Bill Report",
//         path: "/sub-admin/order-to-bill-report",
//         icon: LuBookDown,
//       },
//       {
//         label: "Sales Bill Report",
//         path: "/sub-admin/sales-bill-report",
//         icon: LuBookDown,
//       },
//       {
//         label: "Sales Return Report",
//         path: "/sub-admin/sales-return-report",
//         icon: LuBookDown,
//       },
//       // {
//       //   label: "Collection Report",
//       //   path: "/sub-admin-primary/collection-report",
//       //   icon: LuBookDown,
//       // },
//       {
//         label: "Distributor RBP Ledger",
//         path: "/sub-admin/distributor-rbp-ledger",
//         icon: LuBookDown,
//       },
//       {
//         label: "Retailer RBP Ledger",
//         path: "/sub-admin/retailer-rbp-ledger",
//         icon: LuBookDown,
//       },
//       {
//         label: "Distributor Inventory Report",
//         path: "/sub-admin/distributor-inventory-report",
//         icon: LuBookDown,
//       },
//     ],
//   },
//   {
//     type: "collapse",
//     label: "Geo Hierarchy",
//     icon: AiOutlineMenuUnfold,
//     children: [
//       {
//         label: "Zone",
//         path: "/sub-admin/zone",
//         icon: BiSolidCategory,
//       },
//       {
//         label: "State",
//         path: "/sub-admin/state",
//         icon: FaLayerGroup,
//       },
//       {
//         label: "Region",
//         path: "/sub-admin/region",
//         icon: BsCollectionFill,
//       },
//     ],
//   },
//   {
//     type: "collapse",
//     label: "Product Master",
//     icon: AiOutlineMenuUnfold,
//     children: [
//       {
//         label: "Brand",
//         path: "/sub-admin/brand",
//         icon: MdVerifiedUser,
//       },
//       {
//         label: "Sub-Brand",
//         path: "/sub-admin/sub-brand",
//         icon: BiDisc,
//       },
//       {
//         label: "Category",
//         path: "/sub-admin/category",
//         icon: BiSolidCategory,
//       },
//       {
//         label: "Collection",
//         path: "/sub-admin/collection",
//         icon: BsCollectionFill,
//       },
//       {
//         label: "Product",
//         path: "/sub-admin/products",
//         icon: FaProductHunt,
//       },
//     ],
//   },
//   {
//     type: "collapse",
//     label: "Pricing Master",
//     icon: AiOutlineMenuUnfold,
//     children: [
//       {
//         label: "Pricing",
//         path: "/sub-admin/pricing",
//         icon: IoPricetags,
//       },
//       {
//         label: "Price Update",
//         path: "/sub-admin/price-update",
//         icon: IoPricetags,
//       },
//     ],
//   },
//   {
//     type: "collapse",
//     label: "Distributor Master",
//     icon: AiOutlineMenuUnfold,
//     children: [
//       {
//         label: "Distributer",
//         path: "/sub-admin/distributer",
//         icon: FaUsers,
//       },
//     ],
//   },
//   {
//     type: "collapse",
//     label: "Sales Hierarchy",
//     icon: AiOutlineMenuUnfold,
//     children: [
//       {
//         label: "Designation",
//         path: "/sub-admin/designation",
//         icon: FaUsers,
//       },
//       {
//         label: "Employee",
//         path: "/sub-admin/employee",
//         icon: FaPerson,
//       },
//     ],
//   },
//   {
//     type: "collapse",
//     label: "Route Master",
//     icon: AiOutlineMenuUnfold,
//     children: [
//       {
//         label: "Beat",
//         path: "/sub-admin/beat",
//         icon: FaRoute,
//       },
//       {
//         label: "Beat Mapping",
//         path: "/sub-admin/beat-mapping",
//         icon: FaUsersGear,
//       },
//     ],
//   },
//   {
//     type: "collapse",
//     label: "Plant Master",
//     icon: AiOutlineMenuUnfold,
//     children: [
//       {
//         label: "Plant",
//         path: "/sub-admin/plant",
//         icon: FaRegBuilding,
//       },
//     ],
//   },
//   {
//     type: "collapse",
//     label: "Outlet Master",
//     icon: AiOutlineMenuUnfold,
//     children: [
//       {
//         label: "Outlet List",
//         path: "/sub-admin/outlet-list",
//         icon: FaCodePullRequest,
//       },
//     ],
//   },
//   {
//     type: "collapse",
//     label: "Reason Master",
//     icon: AiOutlineMenuUnfold,
//     children: [
//       {
//         label: "Reasons",
//         path: "/sub-admin/reason-master",
//         icon: IoIosAdd,
//       },
//     ],
//   },
//   {
//     type: "collapse",
//     label: "Purchase",
//     icon: AiOutlineMenuUnfold,
//     children: [
//       {
//         label: "Supplier Master",
//         path: "/sub-admin/supplier-list",
//         icon: FaListAlt,
//       },

//       {
//         label: "Purchase Invoice Log",
//         path: "/sub-admin/purchase-invoice-log",
//         icon: FaList,
//       },
//       {
//         label: "Purchase  Order Log",
//         path: "/sub-admin/purchase-order-log",
//         icon: FaList,
//       },
//     ],
//   },
//   {
//     type: "collapse",
//     label: "Sales",
//     icon: AiOutlineMenuUnfold,
//     children: [
//       {
//         label: "Sales Order Log",
//         path: "/sub-admin/sales-order-log",
//         icon: FaListAlt,
//       },
//     ],
//   },
//   {
//     type: "collapse",
//     label: "RBP App",
//     icon: AiOutlineMenuUnfold,
//     children: [
//       // {
//       //   label: "App Banner",
//       //   path: "/sub-admin/rvp-app-banner",
//       //   icon: PiFlagBannerFoldLight,
//       // },
//       // {
//       //   label: "Gift Master",
//       //   path: "/sub-admin/rbp-reward-products",
//       //   icon: FaGift,
//       // },
//       // {
//       //   label: "Terms & Conditions",
//       //   path: "/sub-admin/rvp-terms-conditions",
//       //   icon: MdChecklist,
//       // },
//       // {
//       //   label: "Catalogue",
//       //   path: "/sub-admin/rvp-catalogue",
//       //   icon: MdChecklist,
//       // },
//       {
//         label: "Multiplier Slab Config",
//         path: "/sub-admin/multiplier-slab-config",
//         icon: MdChecklist,
//       },
//       {
//         label: "Reward Transactions",
//         path: "/sub-admin/reward-transactions",
//         icon: MdChecklist,
//       },
//       {
//         label: "Multiplier Transactions",
//         path: "/sub-admin/multiplier-transactions",
//         icon: MdChecklist,
//       },
//     ],
//   },
//   // {
//   //   type: "collapse",
//   //   label: "Settings & Configs",
//   //   icon: AiOutlineMenuUnfold,
//   //   children: [
//   //     {
//   //       label: "Settings & Configs",
//   //       path: "/admin/settings",
//   //       icon: CiSettings,
//   //     },
//   //   ],
//   // },
//   // {
//   //   type: "collapse",
//   //   label: "Target Setting",
//   //   icon: AiOutlineMenuUnfold,
//   //   children: [
//   //     {
//   //       label: "Primary Target Setting",
//   //       path: "/admin/primary-target-setting",
//   //       icon: CiSettings,
//   //     },
//   //   ],
//   // },
//   // {
//   //   type: "item",
//   //   label: "HelpDesk",
//   //   path: "/admin/view-helpdesk",
//   //   icon: MdChecklist,
//   // },
//   {
//     type: "item",
//     label: "Logout",
//     path: "/logout",
//     icon: FaSignOutAlt,
//     isLogout: true,
//   },
// ];

export const need_employee_approval_for_po_paths_for_admin = [
  "/admin/purchase-order-list",
];

export const no_need_employee_approval_for_po_paths_for_admin = [
  "/admin/purchase-order-log",
];
