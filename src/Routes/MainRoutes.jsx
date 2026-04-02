import { useSelector } from "react-redux";
import { Navigate, Outlet, useRoutes } from "react-router-dom";

// Layouts
import { DashboardLayout } from "../layouts/DashboardLayout";
import { EmpDashboardLayout } from "../layouts/EmpDashboardLayout";
import { RootLayout } from "../layouts/RootLayout";

// Admin Pages
import Beat from "../pages/admin/Beat";
import { BeatMapping } from "../pages/admin/BeatMapping";
import Brand from "../pages/admin/Brand";
import Category from "../pages/admin/Category";
import Collection from "../pages/admin/Collection";
import { DashboardPage } from "../pages/admin/DashboardPage";
import Designation from "../pages/admin/Designation";
import Distributor from "../pages/admin/Distributor";
import { Employee } from "../pages/admin/Employee";
import OutletList from "../pages/admin/OutletList";
import DuplicateOutletReport from "../pages/admin/DuplicateOutletReport";
import Pricing from "../pages/admin/Pricing";
import Products from "../pages/admin/Products";
import ReasonMaster from "../pages/admin/ReasonMaster";
import Region from "../pages/admin/Region";
import District from "../pages/admin/District";
import NewOutletTransfer from "../pages/admin/NewOutletTransfer";
import OutletRequestList from "../pages/admin/OutletRequestList";
import PlantMaster from "../pages/admin/PlantMaster";
import { Settings } from "../pages/admin/SiteSettings/Settings";
import CronSettings from "../pages/admin/cronJobs/CronSettings";
import State from "../pages/admin/State";
import SubBrand from "../pages/admin/SubBrand";
import { SupplierMaster } from "../pages/admin/SupplierMaster";
import Zone from "../pages/admin/Zone";
import SalesOrderLog from "../pages/admin/SalesOrderLog";
import PuchaseInvoiceLog from "../pages/admin/PuchaseInvoiceLog";

// Admin Purchase Order Pages
import { AdminParchaseOrderDetails } from "../pages/admin/AdminPurchasOrder/AdminParchaseOrderDetails";
import { AdminParchesOrderList } from "../pages/admin/AdminPurchasOrder/AdminParchesOrderList";
import { AdminPurchasOrderEdit } from "../pages/admin/AdminPurchasOrder/AdminPurchasOrderEdit";
import ViewPurchaseOrder from "../pages/admin/AdminPurchasOrder/ViewPurchaseOrder";

// Admin Reports
import { OrderReport } from "../pages/admin/AdminReports/OrderReport";
import PrimaryInvoiceReport from "../pages/admin/AdminReports/PrimaryInvoiceReport";
import OrderToBillReport from "../pages/admin/AdminReports/OrderToBillReport";
import StockAdjustmentReport from "../pages/admin/AdminReports/StockAdjustmentReport";
import SalesBillReport from "../pages/admin/AdminReports/SalesBillReport";

// Employee Pages
import { EmpDashboardPage } from "../pages/Employee/EmpDashboardPage";
import EmployeeProfile from "../pages/Employee/EmployeeProfile";
import { ParchaseOrderDetails } from "../pages/Employee/PurchasOrder/ParchaseOrderDetails";
import { ParchesOrderList } from "../pages/Employee/PurchasOrder/ParchesOrderList";
import { PurchasOrderEdit } from "../pages/Employee/PurchasOrder/PurchasOrderEdit";

// External Pages
import { OutletForm } from "../pages/external/OutletForm";
import { HomePage } from "../pages/HomePage";
import { NotFound } from "../pages/NotFound";
import { Profile } from "../pages/Profile";
import { ResetPass } from "../pages/ResetPass";
import { SignIn } from "../pages/SignIn";

// Reward App
import AppBanner from "../pages/RewardApp/AppBanner";
import Catalogue from "../pages/RewardApp/Catalogue";
import CreateGift from "../pages/RewardApp/GiftProductMaster/CreateGift";
import EditGift from "../pages/RewardApp/GiftProductMaster/EditGift";
import GiftList from "../pages/RewardApp/GiftProductMaster/GiftList";
import TermsAndCondition from "../pages/RewardApp/TermsAndCondition";
import AllRewardTransactions from "../pages/RewardApp/AllRewardTransactions";
import PriceUpdate from "../pages/admin/PriceUpdate";
import PurchaseOrderReport from "../pages/admin/AdminReports/PurchaseOrderReport";
import StockReport from "../pages/admin/AdminReports/StockReport";
import RetailerMultiplierTransactions from "../pages/RewardApp/RetailerMultiplierTransactions";
import { RetailerMultiplierSlabConfig } from "../pages/RewardApp/RetailerMultiplierSlabConfig";
import DistributorRBPLedger from "../pages/admin/AdminReports/DistributorRBPLedger";
import StockReportLedger from "../pages/admin/AdminReports/StockReportLedger";
import RetailerRBPLedger from "../pages/admin/AdminReports/RetailerRBPLedger";
import HelpDesk from "../pages/admin/HelpDesk";
import PrimaryTargetSetting from "../pages/admin/PrimaryTargetSetting";
import ZoneView from "../pages/admin/ZoneView";
import RegionView from "../pages/admin/RegionView";
import StateView from "../pages/admin/StateView";
import BrandView from "../pages/admin/BrandView";
import SubBrandView from "../pages/admin/SubBrandView";
import CategoryView from "../pages/admin/CategoryView";
import ProductsView from "../pages/admin/ProductsView";
import CollectionView from "../pages/admin/CollectionView";
import PricingView from "../pages/admin/PricingView";
import DistributorView from "../pages/admin/DistributorView";
import DesignationView from "../pages/admin/DesiganationView";
import { EmployeeView } from "../pages/admin/EmployeeView";
import BeatView from "../pages/admin/BeatView";
import { BeatMappingView } from "../pages/admin/BeatMappingView";
import PlantMasterView from "../pages/admin/PlantMasterView";
import OutletListView from "../pages/admin/OutletListView";
import ReasonMasterView from "../pages/admin/ReasonMasterView";
import { SupplierMasterView } from "../pages/admin/SupplierMasterView";
import SalesReturnReports from "../pages/admin/AdminReports/SalesReturnReports";
import CollectionReport from "../pages/admin/AdminReports/CollectionReport";
import AllDistributorOrderList from "../pages/admin/AllDistributorOrderList";
import DistributorViewAdjustment from "../pages/admin/AdminReports/DistributorViewAdjustment";
import PurchaseReturnLog from "../pages/admin/PurchaseReturnLog";
import RetailerTransaction from "../pages/RewardApp/RBP/RetailerTransaction";
import RbpCatalogue from "../pages/admin/RbpCatalogue";
import RbpBanner from "../pages/admin/RbpBanner";
import GiftListOrder from "../pages/RewardApp/GiftOrder/GiftListOrder";
import GiftOrderDetails from "../pages/RewardApp/GiftOrder/GiftOrderDetails";
import VersionList from "../pages/RewardApp/AppVersion/VersionList";
import DeletedDataLog from "../pages/admin/DeletedDataLog";
import PrimarySlab from "../pages/admin/PrimarySlab";
import SecondarySlab from "../pages/admin/SecondarySlab";
import InactiveOutletOrderReport from "../pages/admin/InactiveOutletOrderReport";
import UsegesReport from "../pages/admin/AdminReports/UsegesReport";

import SecondaryTarget from "../pages/admin/SecondaryTarget";

import ImageConvert from "../pages/admin/ImageConverter/ImageConvert";
import UserManagement from "../pages/admin/user/UserManagement";
import MultiplierHistoryReport from "../pages/admin/AdminReports/MultiplierHistoryReport";
import Announcements from "../pages/admin/Announcements";
import AllNotifications from "../pages/admin/AllNotifications";
import CreateNewPage from "../pages/admin/AdminReports/createNewPage";
// Helper to conditionally add routes
const addIf = (condition, route) => (condition ? [route] : []);

export const MainRoutes = () => {
  const { userInfo } = useSelector((state) => state.user);
  const { config } = useSelector((state) => state.config);
  const functionalSettings = config?.functionalSettings || {};
  const IsApprovalRequest = functionalSettings.need_employee_approval_for_po;
  const role = userInfo?.role?.toLowerCase();

  // --- Authenticated Routes ---
  const authenticatedRoutes = [
    {
      path: "/",
      children: [
        { path: "", element: <Navigate to={`/${role}`} replace /> },
        { path: "sign-in", element: <Navigate to={`/${role}`} replace /> },
        { path: "form/outlet-form", element: <OutletForm /> },
      ],
    },

    // Attention Please //
    // IF yoy here to adding any routes then you have to add in all routes (Super admin , admin, sub-admins, user, sales )

    // --- Admin Routes (Super Admin ---/////////////////////////////////////////////////////////////////////////////////////////////////
    ...(role === "admin"
      ? [
          {
            path: "/admin",
            element: <DashboardLayout />,
            children: [
              { path: "", element: <Navigate to="/admin/dashboard" replace /> },
              { path: "dashboard", element: <DashboardPage /> },
              { path: "category", element: <Category /> },
              { path: "collection", element: <Collection /> },
              { path: "brand", element: <Brand /> },
              { path: "sub-brand", element: <SubBrand /> },
              { path: "products", element: <Products /> },
              { path: "distributer", element: <Distributor /> },
              { path: "pricing", element: <Pricing /> },
              { path: "price-update", element: <PriceUpdate /> },
              { path: "zone", element: <Zone /> },
              { path: "region", element: <Region /> },
              { path: "state", element: <State /> },
              { path: "district", element: <District /> },
              { path: "profile", element: <Profile /> },
              { path: "designation", element: <Designation /> },
              { path: "employee", element: <Employee /> },
              { path: "beat", element: <Beat /> },
              { path: "beat-mapping", element: <BeatMapping /> },
              { path: "outlet-form", element: <OutletForm /> },
              { path: "outlet-requests", element: <OutletRequestList /> },
              { path: "outlet-list", element: <OutletList /> },
              {
                path: "duplicate-outlet-report",
                element: <DuplicateOutletReport />,
              },
              {
                path: "inactive-outlet-order-report",
                element: <InactiveOutletOrderReport />,
              },

              { path: "outlet-transfer-copy", element: <NewOutletTransfer /> },
              { path: "reason-master", element: <ReasonMaster /> },
              ...addIf(IsApprovalRequest === "admin approval", {
                path: "purchase-order-list",
                element: <AdminParchesOrderList />,
              }),
              ...addIf(IsApprovalRequest === "admin approval", {
                path: "purchase-order-edit/:id",
                element: <AdminPurchasOrderEdit />,
              }),
              ...addIf(
                ["admin approval", "no approval", "agent approval"].includes(
                  IsApprovalRequest,
                ),
                {
                  path: "purchase-order-detail/:id",
                  element: <AdminParchaseOrderDetails />,
                },
              ),
              ...addIf(
                ["no approval", "agent approval"].includes(IsApprovalRequest),
                {
                  path: "purchase-order-log",
                  element: <ViewPurchaseOrder />,
                },
              ),
              { path: "supplier-list", element: <SupplierMaster /> },
              { path: "purchase-invoice-log", element: <PuchaseInvoiceLog /> },
              { path: "purchase-return-log", element: <PurchaseReturnLog /> },
              { path: "sales-order-log", element: <SalesOrderLog /> },
              {
                path: "all-db-orders-list",
                element: <AllDistributorOrderList />,
              },
              { path: "plant", element: <PlantMaster /> },
              { path: "settings", element: <Settings /> },
              { path: "cron-settings", element: <CronSettings /> },

              // Reports
              { path: "order-report", element: <OrderReport /> },
              {
                path: "primary-invoice-report",
                element: <PrimaryInvoiceReport />,
              },
              { path: "Order-to-bill-report", element: <OrderToBillReport /> },
              { path: "stock-report", element: <StockReport /> },
              // {
              //   path: "stock-adjustment-report",
              //   element: <StockAdjustmentReport />,
              // },
              { path: "sales-bill-report", element: <SalesBillReport /> },
              {
                path: "purchase-order-report",
                element: <PurchaseOrderReport />,
              },

              {
                path: "sales-return-report",
                element: <SalesReturnReports />,
              },
              // {
              //   path: "collection-report",
              //   element: <CollectionReport />,
              // },
              {
                path: "distributor-rbp-ledger",
                element: <DistributorRBPLedger />,
              },
              {
                path: "stock-report-ledger",
                element: <StockReportLedger />,
              },
              {
                path: "usage-report",
                element: <UsegesReport />,
              },
              {
                path: "retailer-rbp-ledger",
                element: <RetailerRBPLedger />,
              },
              {
                path: "multiplier-transaction-history",
                element: <MultiplierHistoryReport />,
              },
              {
                path: "view-helpdesk",
                element: <HelpDesk />,
              },
              {
                path: "primary-target-setting",
                element: <PrimaryTargetSetting />,
              },
              {
                path: "secondary-target",
                element: <SecondaryTarget />,
              },
              {
                path: "distributor-inventory-report",
                element: <DistributorViewAdjustment />,
              },

              // Reward App
              { path: "rbp-reward-products", element: <GiftList /> },
              { path: "rbp-prodicut-create", element: <CreateGift /> },
              { path: "rbp-prodicut-edit/:id", element: <EditGift /> },
              { path: "rbp-terms-conditions", element: <TermsAndCondition /> },
              // { path: "rvp-catalogue", element: <Catalogue /> },
              // { path: "rvp-app-banner", element: <AppBanner /> },
              {
                path: "rbp-reward-transactions",
                element: <AllRewardTransactions />,
              },
              {
                path: "retailer-multiplier-transactions",
                element: <RetailerMultiplierTransactions />,
              },
              {
                path: "retailer-multiplier-slab-config",
                element: <RetailerMultiplierSlabConfig />,
              },
              {
                path: "retailer-transaction-history",
                element: <RetailerTransaction />,
              },
              {
                path: "rbp-catalogue",
                element: <RbpCatalogue />,
              },
              {
                path: "rbp-banner",
                element: <RbpBanner />,
              },
              {
                path: "retailer-orders",
                element: <GiftListOrder />,
              },
              {
                path: "retailer-orders/:id",
                element: <GiftOrderDetails />,
              },
              {
                path: "app-versions",
                element: <VersionList />,
              },
              {
                path: "image-converter",
                element: <ImageConvert />,
              },
              {
                path: "announcements",
                element: <Announcements />,
              },
              {
                path: "notifications",
                element: <AllNotifications />,
              },
              {
                path: "deleted-data-log",
                element: <DeletedDataLog />,
              },
              {
                path: "primary-slab",
                element: <PrimarySlab />,
              },
              {
                path: "secondary-slab",
                element: <SecondarySlab />,
              },
              {
                path: "user-management",
                element: <UserManagement />,
              },
              {
                path: "create-page",
                element: <CreateNewPage />,

              }
            ],
          },
        ]
      : []),

    //  For Role Sales/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    ...(role === "sales"
      ? [
          {
            path: "/sales",
            element: <DashboardLayout />,
            children: [
              { path: "", element: <Navigate to="/sales/dashboard" replace /> },
              { path: "dashboard", element: <DashboardPage /> },
              { path: "category", element: <Category /> },
              { path: "collection", element: <Collection /> },
              { path: "brand", element: <Brand /> },
              { path: "sub-brand", element: <SubBrand /> },
              { path: "products", element: <Products /> },
              { path: "distributer", element: <Distributor /> },
              { path: "pricing", element: <Pricing /> },
              { path: "price-update", element: <PriceUpdate /> },
              { path: "zone", element: <Zone /> },
              { path: "region", element: <Region /> },
              { path: "state", element: <State /> },
              { path: "district", element: <District /> },
              { path: "profile", element: <Profile /> },
              { path: "designation", element: <Designation /> },
              { path: "employee", element: <Employee /> },
              { path: "beat", element: <Beat /> },
              { path: "beat-mapping", element: <BeatMapping /> },
              { path: "outlet-form", element: <OutletForm /> },
              { path: "outlet-requests", element: <OutletRequestList /> },
              { path: "outlet-list", element: <OutletList /> },
              {
                path: "duplicate-outlet-report",
                element: <DuplicateOutletReport />,
              },
              {
                path: "inactive-outlet-order-report",
                element: <InactiveOutletOrderReport />,
              },

              { path: "outlet-transfer-copy", element: <NewOutletTransfer /> },
              { path: "reason-master", element: <ReasonMaster /> },
              ...addIf(IsApprovalRequest === "admin approval", {
                path: "purchase-order-list",
                element: <AdminParchesOrderList />,
              }),
              ...addIf(IsApprovalRequest === "admin approval", {
                path: "purchase-order-edit/:id",
                element: <AdminPurchasOrderEdit />,
              }),
              ...addIf(
                ["admin approval", "no approval", "agent approval"].includes(
                  IsApprovalRequest,
                ),
                {
                  path: "purchase-order-detail/:id",
                  element: <AdminParchaseOrderDetails />,
                },
              ),
              ...addIf(
                ["no approval", "agent approval"].includes(IsApprovalRequest),
                {
                  path: "purchase-order-log",
                  element: <ViewPurchaseOrder />,
                },
              ),
              { path: "supplier-list", element: <SupplierMaster /> },
              { path: "purchase-invoice-log", element: <PuchaseInvoiceLog /> },
              { path: "purchase-return-log", element: <PurchaseReturnLog /> },
              { path: "sales-order-log", element: <SalesOrderLog /> },
              {
                path: "all-db-orders-list",
                element: <AllDistributorOrderList />,
              },
              { path: "plant", element: <PlantMaster /> },
              { path: "settings", element: <Settings /> },
              { path: "cron-settings", element: <CronSettings /> },

              // Reports
              { path: "order-report", element: <OrderReport /> },
              {
                path: "primary-invoice-report",
                element: <PrimaryInvoiceReport />,
              },
              { path: "Order-to-bill-report", element: <OrderToBillReport /> },
              { path: "stock-report", element: <StockReport /> },
              // {
              //   path: "stock-adjustment-report",
              //   element: <StockAdjustmentReport />,
              // },
              { path: "sales-bill-report", element: <SalesBillReport /> },
              {
                path: "purchase-order-report",
                element: <PurchaseOrderReport />,
              },

              {
                path: "sales-return-report",
                element: <SalesReturnReports />,
              },
              // {
              //   path: "collection-report",
              //   element: <CollectionReport />,
              // },
              {
                path: "distributor-rbp-ledger",
                element: <DistributorRBPLedger />,
              },
              {
                path: "stock-report-ledger",
                element: <StockReportLedger />,
              },
              {
                path: "usage-report",
                element: <UsegesReport />,
              },
              {
                path: "retailer-rbp-ledger",
                element: <RetailerRBPLedger />,
              },
              {
                path: "view-helpdesk",
                element: <HelpDesk />,
              },
              {
                path: "primary-target-setting",
                element: <PrimaryTargetSetting />,
              },
              {
                path: "secondary-target",
                element: <SecondaryTarget />,
              },
              {
                path: "distributor-inventory-report",
                element: <DistributorViewAdjustment />,
              },

              // Reward App
              { path: "rbp-reward-products", element: <GiftList /> },
              { path: "rbp-prodicut-create", element: <CreateGift /> },
              { path: "rbp-prodicut-edit/:id", element: <EditGift /> },
              { path: "rbp-terms-conditions", element: <TermsAndCondition /> },
              // { path: "rvp-catalogue", element: <Catalogue /> },
              // { path: "rvp-app-banner", element: <AppBanner /> },
              {
                path: "rbp-reward-transactions",
                element: <AllRewardTransactions />,
              },
              {
                path: "retailer-multiplier-transactions",
                element: <RetailerMultiplierTransactions />,
              },
              {
                path: "multiplier-transaction-history",
                element: <MultiplierHistoryReport />,
              },
              {
                path: "retailer-multiplier-slab-config",
                element: <RetailerMultiplierSlabConfig />,
              },
              {
                path: "retailer-transaction-history",
                element: <RetailerTransaction />,
              },
              {
                path: "rbp-catalogue",
                element: <RbpCatalogue />,
              },
              {
                path: "rbp-banner",
                element: <RbpBanner />,
              },
              {
                path: "retailer-orders",
                element: <GiftListOrder />,
              },
              {
                path: "retailer-orders/:id",
                element: <GiftOrderDetails />,
              },
              {
                path: "image-converter",
                element: <ImageConvert />,
              },
              {
                path: "deleted-data-log",
                element: <DeletedDataLog />,
              },
              {
                path: "primary-slab",
                element: <PrimarySlab />,
              },
              {
                path: "secondary-slab",
                element: <SecondarySlab />,
              },
              {
                path: "app-versions",
                element: <VersionList />,
              },

              // {
              //   path: "user-management",
              //   element: <UserManagement />,
              // },
            ],
          },
        ]
      : []),

    // For Role USer/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    ...(role === "user"
      ? [
          {
            path: "/user",
            element: <DashboardLayout />,
            children: [
              { path: "", element: <Navigate to="/user/dashboard" replace /> },
              { path: "dashboard", element: <DashboardPage /> },
              { path: "category", element: <Category /> },
              { path: "collection", element: <Collection /> },
              { path: "brand", element: <Brand /> },
              { path: "sub-brand", element: <SubBrand /> },
              { path: "products", element: <Products /> },
              { path: "distributer", element: <Distributor /> },
              { path: "pricing", element: <Pricing /> },
              { path: "price-update", element: <PriceUpdate /> },
              { path: "zone", element: <Zone /> },
              { path: "region", element: <Region /> },
              { path: "state", element: <State /> },
              { path: "district", element: <District /> },
              { path: "profile", element: <Profile /> },
              { path: "designation", element: <Designation /> },
              { path: "employee", element: <Employee /> },
              { path: "beat", element: <Beat /> },
              { path: "beat-mapping", element: <BeatMapping /> },
              { path: "outlet-form", element: <OutletForm /> },
              { path: "outlet-requests", element: <OutletRequestList /> },
              { path: "outlet-list", element: <OutletList /> },
              {
                path: "duplicate-outlet-report",
                element: <DuplicateOutletReport />,
              },
              {
                path: "inactive-outlet-order-report",
                element: <InactiveOutletOrderReport />,
              },

              { path: "outlet-transfer-copy", element: <NewOutletTransfer /> },
              { path: "reason-master", element: <ReasonMaster /> },
              ...addIf(IsApprovalRequest === "admin approval", {
                path: "purchase-order-list",
                element: <AdminParchesOrderList />,
              }),
              ...addIf(IsApprovalRequest === "admin approval", {
                path: "purchase-order-edit/:id",
                element: <AdminPurchasOrderEdit />,
              }),
              ...addIf(
                ["admin approval", "no approval", "agent approval"].includes(
                  IsApprovalRequest,
                ),
                {
                  path: "purchase-order-detail/:id",
                  element: <AdminParchaseOrderDetails />,
                },
              ),
              ...addIf(
                ["no approval", "agent approval"].includes(IsApprovalRequest),
                {
                  path: "purchase-order-log",
                  element: <ViewPurchaseOrder />,
                },
              ),
              { path: "supplier-list", element: <SupplierMaster /> },
              { path: "purchase-invoice-log", element: <PuchaseInvoiceLog /> },
              { path: "purchase-return-log", element: <PurchaseReturnLog /> },
              { path: "sales-order-log", element: <SalesOrderLog /> },
              {
                path: "all-db-orders-list",
                element: <AllDistributorOrderList />,
              },
              { path: "plant", element: <PlantMaster /> },
              { path: "settings", element: <Settings /> },
              { path: "cron-settings", element: <CronSettings /> },

              // Reports
              { path: "order-report", element: <OrderReport /> },
              {
                path: "primary-invoice-report",
                element: <PrimaryInvoiceReport />,
              },
              { path: "Order-to-bill-report", element: <OrderToBillReport /> },
              { path: "stock-report", element: <StockReport /> },
              // {
              //   path: "stock-adjustment-report",
              //   element: <StockAdjustmentReport />,
              // },
              { path: "sales-bill-report", element: <SalesBillReport /> },
              {
                path: "purchase-order-report",
                element: <PurchaseOrderReport />,
              },

              {
                path: "sales-return-report",
                element: <SalesReturnReports />,
              },
              // {
              //   path: "collection-report",
              //   element: <CollectionReport />,
              // },
              {
                path: "distributor-rbp-ledger",
                element: <DistributorRBPLedger />,
              },
              {
                path: "stock-report-ledger",
                element: <StockReportLedger />,
              },
              {
                path: "usage-report",
                element: <UsegesReport />,
              },
              {
                path: "retailer-rbp-ledger",
                element: <RetailerRBPLedger />,
              },
              {
                path: "view-helpdesk",
                element: <HelpDesk />,
              },
              {
                path: "primary-target-setting",
                element: <PrimaryTargetSetting />,
              },
              {
                path: "secondary-target",
                element: <SecondaryTarget />,
              },
              {
                path: "distributor-inventory-report",
                element: <DistributorViewAdjustment />,
              },

              // Reward App
              { path: "rbp-reward-products", element: <GiftList /> },
              { path: "rbp-prodicut-create", element: <CreateGift /> },
              { path: "rbp-prodicut-edit/:id", element: <EditGift /> },
              { path: "rbp-terms-conditions", element: <TermsAndCondition /> },
              { path: "app-versions", element: <VersionList /> },
              // { path: "rvp-catalogue", element: <Catalogue /> },
              // { path: "rvp-app-banner", element: <AppBanner /> },
              {
                path: "rbp-reward-transactions",
                element: <AllRewardTransactions />,
              },
              {
                path: "retailer-multiplier-transactions",
                element: <RetailerMultiplierTransactions />,
              },
              {
                path: "retailer-multiplier-slab-config",
                element: <RetailerMultiplierSlabConfig />,
              },
              {
                path: "retailer-transaction-history",
                element: <RetailerTransaction />,
              },
              {
                path: "multiplier-transaction-history",
                element: <MultiplierHistoryReport />,
              },
              {
                path: "rbp-catalogue",
                element: <RbpCatalogue />,
              },
              {
                path: "rbp-banner",
                element: <RbpBanner />,
              },
              {
                path: "retailer-orders",
                element: <GiftListOrder />,
              },
              {
                path: "retailer-orders/:id",
                element: <GiftOrderDetails />,
              },
              {
                path: "image-converter",
                element: <ImageConvert />,
              },
              {
                path: "announcements",
                element: <Announcements />,
              },
              {
                path: "notifications",
                element: <AllNotifications />,
              },
              {
                path: "deleted-data-log",
                element: <DeletedDataLog />,
              },
              {
                path: "primary-slab",
                element: <PrimarySlab />,
              },
              {
                path: "secondary-slab",
                element: <SecondarySlab />,
              },
              // {
              //   path: "user-management",
              //   element: <UserManagement />,
              // },
            ],
          },
        ]
      : []),

    // for admine (Admin) /////////////////////////////////////////////////////////////////////////////////////

    ...(role === "admine"
      ? [
          {
            path: "/admine",
            element: <DashboardLayout />,
            children: [
              {
                path: "",
                element: <Navigate to="/admine/dashboard" replace />,
              },
              { path: "dashboard", element: <DashboardPage /> },
              { path: "category", element: <Category /> },
              { path: "collection", element: <Collection /> },
              { path: "brand", element: <Brand /> },
              { path: "sub-brand", element: <SubBrand /> },
              { path: "products", element: <Products /> },
              { path: "distributer", element: <Distributor /> },
              { path: "pricing", element: <Pricing /> },
              { path: "price-update", element: <PriceUpdate /> },
              { path: "zone", element: <Zone /> },
              { path: "region", element: <Region /> },
              { path: "state", element: <State /> },
              { path: "district", element: <District /> },
              { path: "profile", element: <Profile /> },
              { path: "designation", element: <Designation /> },
              { path: "employee", element: <Employee /> },
              { path: "beat", element: <Beat /> },
              { path: "beat-mapping", element: <BeatMapping /> },
              { path: "outlet-form", element: <OutletForm /> },
              { path: "outlet-requests", element: <OutletRequestList /> },
              { path: "outlet-list", element: <OutletList /> },
              {
                path: "duplicate-outlet-report",
                element: <DuplicateOutletReport />,
              },
              {
                path: "inactive-outlet-order-report",
                element: <InactiveOutletOrderReport />,
              },

              { path: "outlet-transfer-copy", element: <NewOutletTransfer /> },
              { path: "reason-master", element: <ReasonMaster /> },
              ...addIf(IsApprovalRequest === "admin approval", {
                path: "purchase-order-list",
                element: <AdminParchesOrderList />,
              }),
              ...addIf(IsApprovalRequest === "admin approval", {
                path: "purchase-order-edit/:id",
                element: <AdminPurchasOrderEdit />,
              }),
              ...addIf(
                ["admin approval", "no approval", "agent approval"].includes(
                  IsApprovalRequest,
                ),
                {
                  path: "purchase-order-detail/:id",
                  element: <AdminParchaseOrderDetails />,
                },
              ),
              ...addIf(
                ["no approval", "agent approval"].includes(IsApprovalRequest),
                {
                  path: "purchase-order-log",
                  element: <ViewPurchaseOrder />,
                },
              ),
              { path: "supplier-list", element: <SupplierMaster /> },
              { path: "purchase-invoice-log", element: <PuchaseInvoiceLog /> },
              { path: "purchase-return-log", element: <PurchaseReturnLog /> },
              { path: "sales-order-log", element: <SalesOrderLog /> },
              {
                path: "all-db-orders-list",
                element: <AllDistributorOrderList />,
              },
              { path: "plant", element: <PlantMaster /> },
              { path: "settings", element: <Settings /> },
              { path: "cron-settings", element: <CronSettings /> },

              // Reports
              { path: "order-report", element: <OrderReport /> },
              {
                path: "primary-invoice-report",
                element: <PrimaryInvoiceReport />,
              },
              { path: "Order-to-bill-report", element: <OrderToBillReport /> },
              { path: "stock-report", element: <StockReport /> },
              // {
              //   path: "stock-adjustment-report",
              //   element: <StockAdjustmentReport />,
              // },
              { path: "sales-bill-report", element: <SalesBillReport /> },
              {
                path: "purchase-order-report",
                element: <PurchaseOrderReport />,
              },

              {
                path: "sales-return-report",
                element: <SalesReturnReports />,
              },
              // {
              //   path: "collection-report",
              //   element: <CollectionReport />,
              // },
              {
                path: "distributor-rbp-ledger",
                element: <DistributorRBPLedger />,
              },
              {
                path: "stock-report-ledger",
                element: <StockReportLedger />,
              },
              {
                path: "usage-report",
                element: <UsegesReport />,
              },
              {
                path: "retailer-rbp-ledger",
                element: <RetailerRBPLedger />,
              },
              {
                path: "multiplier-transaction-history",
                element: <MultiplierHistoryReport />,
              },
              {
                path: "view-helpdesk",
                element: <HelpDesk />,
              },
              {
                path: "primary-target-setting",
                element: <PrimaryTargetSetting />,
              },
              {
                path: "secondary-target",
                element: <SecondaryTarget />,
              },
              {
                path: "distributor-inventory-report",
                element: <DistributorViewAdjustment />,
              },

              // Reward App
              { path: "rbp-reward-products", element: <GiftList /> },
              { path: "rbp-prodicut-create", element: <CreateGift /> },
              { path: "rbp-prodicut-edit/:id", element: <EditGift /> },
              { path: "rbp-terms-conditions", element: <TermsAndCondition /> },
              { path: "app-versions", element: <VersionList /> },
              // { path: "rvp-catalogue", element: <Catalogue /> },
              // { path: "rvp-app-banner", element: <AppBanner /> },
              {
                path: "rbp-reward-transactions",
                element: <AllRewardTransactions />,
              },
              {
                path: "retailer-multiplier-transactions",
                element: <RetailerMultiplierTransactions />,
              },
              {
                path: "retailer-multiplier-slab-config",
                element: <RetailerMultiplierSlabConfig />,
              },
              {
                path: "retailer-transaction-history",
                element: <RetailerTransaction />,
              },
              {
                path: "rbp-catalogue",
                element: <RbpCatalogue />,
              },
              {
                path: "rbp-banner",
                element: <RbpBanner />,
              },
              {
                path: "retailer-orders",
                element: <GiftListOrder />,
              },
              {
                path: "retailer-orders/:id",
                element: <GiftOrderDetails />,
              },
              {
                path: "image-converter",
                element: <ImageConvert />,
              },

              {
                path: "deleted-data-log",
                element: <DeletedDataLog />,
              },
              {
                path: "primary-slab",
                element: <PrimarySlab />,
              },
              {
                path: "secondary-slab",
                element: <SecondarySlab />,
              },
              // {
              //   path: "user-management",
              //   element: <UserManagement />,
              // },
            ],
          },
        ]
      : []),

    // for suv-admina (sub-admins) /////////////////////////////////////////////////////////////////////////////////////

    ...(role === "sub-admins"
      ? [
          {
            path: "/sub-admins",
            element: <DashboardLayout />,
            children: [
              {
                path: "",
                element: <Navigate to="/sub-admins/dashboard" replace />,
              },
              { path: "dashboard", element: <DashboardPage /> },
              { path: "category", element: <Category /> },
              { path: "collection", element: <Collection /> },
              { path: "brand", element: <Brand /> },
              { path: "sub-brand", element: <SubBrand /> },
              { path: "products", element: <Products /> },
              { path: "distributer", element: <Distributor /> },
              { path: "pricing", element: <Pricing /> },
              { path: "price-update", element: <PriceUpdate /> },
              { path: "zone", element: <Zone /> },
              { path: "region", element: <Region /> },
              { path: "state", element: <State /> },
              { path: "district", element: <District /> },
              { path: "profile", element: <Profile /> },
              { path: "designation", element: <Designation /> },
              { path: "employee", element: <Employee /> },
              { path: "beat", element: <Beat /> },
              { path: "beat-mapping", element: <BeatMapping /> },
              { path: "outlet-form", element: <OutletForm /> },
              { path: "outlet-requests", element: <OutletRequestList /> },
              { path: "outlet-list", element: <OutletList /> },
              {
                path: "duplicate-outlet-report",
                element: <DuplicateOutletReport />,
              },
              {
                path: "inactive-outlet-order-report",
                element: <InactiveOutletOrderReport />,
              },

              { path: "outlet-transfer-copy", element: <NewOutletTransfer /> },
              { path: "reason-master", element: <ReasonMaster /> },
              ...addIf(IsApprovalRequest === "admin approval", {
                path: "purchase-order-list",
                element: <AdminParchesOrderList />,
              }),
              ...addIf(IsApprovalRequest === "admin approval", {
                path: "purchase-order-edit/:id",
                element: <AdminPurchasOrderEdit />,
              }),
              ...addIf(
                ["admin approval", "no approval", "agent approval"].includes(
                  IsApprovalRequest,
                ),
                {
                  path: "purchase-order-detail/:id",
                  element: <AdminParchaseOrderDetails />,
                },
              ),
              ...addIf(
                ["no approval", "agent approval"].includes(IsApprovalRequest),
                {
                  path: "purchase-order-log",
                  element: <ViewPurchaseOrder />,
                },
              ),
              { path: "supplier-list", element: <SupplierMaster /> },
              { path: "purchase-invoice-log", element: <PuchaseInvoiceLog /> },
              { path: "purchase-return-log", element: <PurchaseReturnLog /> },
              { path: "sales-order-log", element: <SalesOrderLog /> },
              {
                path: "all-db-orders-list",
                element: <AllDistributorOrderList />,
              },
              { path: "plant", element: <PlantMaster /> },
              { path: "settings", element: <Settings /> },
              { path: "cron-settings", element: <CronSettings /> },

              // Reports
              { path: "order-report", element: <OrderReport /> },
              {
                path: "primary-invoice-report",
                element: <PrimaryInvoiceReport />,
              },
              { path: "Order-to-bill-report", element: <OrderToBillReport /> },
              { path: "stock-report", element: <StockReport /> },
              // {
              //   path: "stock-adjustment-report",
              //   element: <StockAdjustmentReport />,
              // },
              { path: "sales-bill-report", element: <SalesBillReport /> },
              {
                path: "purchase-order-report",
                element: <PurchaseOrderReport />,
              },

              {
                path: "sales-return-report",
                element: <SalesReturnReports />,
              },
              // {
              //   path: "collection-report",
              //   element: <CollectionReport />,
              // },
              {
                path: "distributor-rbp-ledger",
                element: <DistributorRBPLedger />,
              },
              {
                path: "stock-report-ledger",
                element: <StockReportLedger />,
              },
              {
                path: "usage-report",
                element: <UsegesReport />,
              },
              {
                path: "retailer-rbp-ledger",
                element: <RetailerRBPLedger />,
              },
              {
                path: "view-helpdesk",
                element: <HelpDesk />,
              },
              {
                path: "primary-target-setting",
                element: <PrimaryTargetSetting />,
              },
              {
                path: "secondary-target",
                element: <SecondaryTarget />,
              },
              {
                path: "distributor-inventory-report",
                element: <DistributorViewAdjustment />,
              },

              // Reward App
              { path: "rbp-reward-products", element: <GiftList /> },
              { path: "rbp-prodicut-create", element: <CreateGift /> },
              { path: "rbp-prodicut-edit/:id", element: <EditGift /> },
              { path: "rbp-terms-conditions", element: <TermsAndCondition /> },
              { path: "app-versions", element: <VersionList /> },
              // { path: "rvp-catalogue", element: <Catalogue /> },
              // { path: "rvp-app-banner", element: <AppBanner /> },
              {
                path: "rbp-reward-transactions",
                element: <AllRewardTransactions />,
              },
              {
                path: "retailer-multiplier-transactions",
                element: <RetailerMultiplierTransactions />,
              },
              {
                path: "retailer-multiplier-slab-config",
                element: <RetailerMultiplierSlabConfig />,
              },
              {
                path: "multiplier-transaction-history",
                element: <MultiplierHistoryReport />,
              },
              {
                path: "retailer-transaction-history",
                element: <RetailerTransaction />,
              },
              {
                path: "rbp-catalogue",
                element: <RbpCatalogue />,
              },
              {
                path: "rbp-banner",
                element: <RbpBanner />,
              },
              {
                path: "retailer-orders",
                element: <GiftListOrder />,
              },
              {
                path: "retailer-orders/:id",
                element: <GiftOrderDetails />,
              },
              {
                path: "image-converter",
                element: <ImageConvert />,
              },
              {
                path: "announcements",
                element: <Announcements />,
              },
              {
                path: "notifications",
                element: <AllNotifications />,
              },
              {
                path: "deleted-data-log",
                element: <DeletedDataLog />,
              },
              {
                path: "primary-slab",
                element: <PrimarySlab />,
              },
              {
                path: "secondary-slab",
                element: <SecondarySlab />,
              },
              // {
              //   path: "user-management",
              //   element: <UserManagement />,
              // },
            ],
          },
        ]
      : []),

    // ...(role === "sub-admin-primary"
    //   ? [
    //       {
    //         path: "/sub-admin-primary",
    //         element: <DashboardLayout />,
    //         children: [
    //           {
    //             path: "",
    //             element: <Navigate to="/sub-admin-primary/dashboard" replace />,
    //           },
    //           // product master routes
    //           { path: "dashboard", element: <DashboardPage /> },
    //           { path: "category", element: <CategoryView /> },
    //           { path: "collection", element: <CollectionView /> },
    //           { path: "brand", element: <BrandView /> },
    //           { path: "sub-brand", element: <SubBrandView /> },
    //           { path: "products", element: <ProductsView /> },
    //           // distributor master
    //           { path: "distributer", element: <DistributorView /> },
    //           // price routes
    //           { path: "pricing", element: <PricingView /> },
    //           { path: "price-update", element: <PriceUpdate /> },
    //           // Geo -Hieararchy
    //           { path: "zone", element: <ZoneView /> },
    //           { path: "region", element: <RegionView /> },
    //           { path: "state", element: <StateView /> },
    //           { path: "district", element: <District /> },
    //           { path: "profile", element: <Profile /> },
    //           // sales -hieararchy
    //           { path: "designation", element: <DesignationView /> },
    //           { path: "employee", element: <EmployeeView /> },
    //           { path: "beat", element: <BeatView /> },
    //           { path: "beat-mapping", element: <BeatMappingView /> },
    //           // outlet routes
    //           { path: "outlet-list", element: <OutletListView /> },

    //           { path: "reason-master", element: <ReasonMasterView /> },

    //           {
    //             path: "purchase-order-log",
    //             element: <ViewPurchaseOrder />,
    //           },

    //           { path: "supplier-list", element: <SupplierMasterView /> },
    //           { path: "purchase-invoice-log", element: <PuchaseInvoiceLog /> },
    //           { path: "sales-order-log", element: <SalesOrderLog /> },
    //           { path: "plant", element: <PlantMasterView /> },

    //           // Reports
    //           { path: "order-report", element: <OrderReport /> },
    //           {
    //             path: "primary-invoice-report",
    //             element: <PrimaryInvoiceReport />,
    //           },
    //           { path: "Order-to-bill-report", element: <OrderToBillReport /> },
    //           { path: "stock-report", element: <StockReport /> },
    //           // {
    //           //   path: "stock-adjustment-report",
    //           //   element: <StockAdjustmentReport />,
    //           // },
    //           { path: "sales-bill-report", element: <SalesBillReport /> },
    //           {
    //             path: "purchase-order-report",
    //             element: <PurchaseOrderReport />,
    //           },
    //           {
    //             path: "sales-return-report",
    //             element: <SalesReturnReports />,
    //           },
    //           // {
    //           //   path: "collection-report",
    //           //   element: <CollectionReport />,
    //           // },
    //           {
    //             path: "distributor-rbp-ledger",
    //             element: <DistributorRBPLedger />,
    //           },
    //           {
    //             path: "stock-report-ledger",
    //             element: <StockReportLedger />,
    //           },
    //           {
    //             path: "retailer-rbp-ledger",
    //             element: <RetailerRBPLedger />,
    //           },
    //           {
    //             path: "distributor-inventory-report",
    //             element: <DistributorViewAdjustment />,
    //           },
    //           {
    //             path: "rbp-reward-transactions",
    //             element: <AllRewardTransactions />,
    //           },
    //           {
    //             path: "retailer-multiplier-transactions",
    //             element: <RetailerMultiplierTransactions />,
    //           },
    //           {
    //             path: "retailer-multiplier-slab-config",
    //             element: <RetailerMultiplierSlabConfig />,
    //           },
    //         ],
    //       },
    //     ]
    //   : []),
    // ...(role === "sub-admin-rbp"
    //   ? [
    //       {
    //         path: "/sub-admin-rbp",
    //         element: <DashboardLayout />,
    //         children: [
    //           {
    //             path: "",
    //             element: <Navigate to="/sub-admin-rbp/dashboard" replace />,
    //           },
    //           { path: "dashboard", element: <DashboardPage /> },
    //           { path: "category", element: <CategoryView /> },
    //           { path: "collection", element: <CollectionView /> },
    //           { path: "brand", element: <BrandView /> },
    //           { path: "sub-brand", element: <SubBrandView /> },
    //           { path: "products", element: <ProductsView /> },
    //           // distributor master
    //           { path: "distributer", element: <DistributorView /> },
    //           // price routes
    //           { path: "pricing", element: <PricingView /> },
    //           { path: "price-update", element: <PriceUpdate /> },
    //           // Geo -Hieararchy
    //           { path: "zone", element: <ZoneView /> },
    //           { path: "region", element: <RegionView /> },
    //           { path: "state", element: <StateView /> },
    //           { path: "district", element: <District /> },
    //           { path: "profile", element: <Profile /> },
    //           // sales -hieararchy
    //           { path: "designation", element: <DesignationView /> },
    //           { path: "employee", element: <EmployeeView /> },
    //           { path: "beat", element: <BeatView /> },
    //           { path: "beat-mapping", element: <BeatMappingView /> },
    //           // outlet routes
    //           { path: "outlet-list", element: <OutletListView /> },

    //           { path: "reason-master", element: <ReasonMasterView /> },

    //           {
    //             path: "purchase-order-log",
    //             element: <ViewPurchaseOrder />,
    //           },

    //           { path: "supplier-list", element: <SupplierMasterView /> },
    //           { path: "purchase-invoice-log", element: <PuchaseInvoiceLog /> },
    //           { path: "sales-order-log", element: <SalesOrderLog /> },
    //           { path: "plant", element: <PlantMasterView /> },

    //           // Reports
    //           { path: "order-report", element: <OrderReport /> },
    //           {
    //             path: "primary-invoice-report",
    //             element: <PrimaryInvoiceReport />,
    //           },
    //           { path: "Order-to-bill-report", element: <OrderToBillReport /> },
    //           { path: "stock-report", element: <StockReport /> },
    //           // {
    //           //   path: "stock-adjustment-report",
    //           //   element: <StockAdjustmentReport />,
    //           // },
    //           { path: "sales-bill-report", element: <SalesBillReport /> },
    //           {
    //             path: "purchase-order-report",
    //             element: <PurchaseOrderReport />,
    //           },
    //           {
    //             path: "sales-return-report",
    //             element: <SalesReturnReports />,
    //           },
    //           // {
    //           //   path: "collection-report",
    //           //   element: <CollectionReport />,
    //           // },
    //           {
    //             path: "distributor-rbp-ledger",
    //             element: <DistributorRBPLedger />,
    //           },
    //           {
    //             path: "stock-report-ledger",
    //             element: <StockReportLedger />,
    //           },
    //           {
    //             path: "retailer-rbp-ledger",
    //             element: <RetailerRBPLedger />,
    //           },
    //           {
    //             path: "rbp-reward-transactions",
    //             element: <AllRewardTransactions />,
    //           },
    //           {
    //             path: "retailer-multiplier-transactions",
    //             element: <RetailerMultiplierTransactions />,
    //           },
    //           {
    //             path: "retailer-multiplier-slab-config",
    //             element: <RetailerMultiplierSlabConfig />,
    //           },
    //           {
    //             path: "distributor-inventory-report",
    //             element: <DistributorViewAdjustment />,
    //           },
    //         ],
    //       },
    //     ]
    //   : []),

    // --- Employee Routes ---
    // ...(role === "employee"
    //   ? [
    //       {
    //         path: "/employee",
    //         element: <EmpDashboardLayout />,
    //         children: [
    //           {
    //             path: "",
    //             element: <Navigate to="/employee/dashboard" replace />,
    //           },
    //           { path: "dashboard", element: <EmpDashboardPage /> },
    //           { path: "employee-profile", element: <EmployeeProfile /> },
    //           ...addIf(IsApprovalRequest === "agent approval", {
    //             path: "purchase-order-list",
    //             element: <ParchesOrderList />,
    //           }),
    //           ...addIf(IsApprovalRequest === "agent approval", {
    //             path: "purchase-order-edit/:id",
    //             element: <PurchasOrderEdit />,
    //           }),
    //           ...addIf(IsApprovalRequest === "agent approval", {
    //             path: "purchase-order-detail/:id",
    //             element: <ParchaseOrderDetails />,
    //           }),
    //         ],
    //       },
    //     ]
    //   : []),

    // --- Fallback Route ---
    { path: "*", element: <NotFound /> },
  ];

  // --- Unauthenticated Routes ---
  const unauthenticatedRoutes = [
    {
      path: "/",
      element: <RootLayout />,
      children: [
        { path: "", element: <HomePage /> },
        { path: "sign-in", element: <SignIn /> },
        { path: "form/outlet-form", element: <OutletForm /> },
        { path: "reset-password/:resetToken", element: <ResetPass /> },
        { path: "*", element: <NotFound /> },
      ],
    },
  ];

  const routes = userInfo ? authenticatedRoutes : unauthenticatedRoutes;

  return useRoutes(routes);
};


