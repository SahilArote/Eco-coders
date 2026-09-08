import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';

// Auth / Login
import LoginPage from './pages/auth/LoginPage';

// Role Dashboards & Dispatcher
import DashboardDispatcher from './pages/dashboard/DashboardDispatcher';
import GateOperatorDashboard from './pages/dashboard/GateOperatorDashboard';
import WeighbridgeDashboard from './pages/dashboard/WeighbridgeDashboard';
import QualityAssayerDashboard from './pages/dashboard/QualityAssayerDashboard';
import AuctionDashboard from './pages/dashboard/AuctionDashboard';
import ProcurementDashboard from './pages/dashboard/ProcurementDashboard';
import AccountsDashboard from './pages/dashboard/AccountsDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';

// Operational Pages
import ProcurementOverview from './pages/procurement/ProcurementOverview';
import CenterDiscovery from './pages/procurement/CenterDiscovery';
import ScheduleSlots from './pages/procurement/ScheduleSlots';
import DigitalTokens from './pages/procurement/DigitalTokens';
import QueueManagement from './pages/procurement/QueueManagement';
import GateEntry from './pages/procurement/GateEntry';
import Weighbridge from './pages/procurement/Weighbridge';
import QualityAssay from './pages/procurement/QualityAssay';
import ProcurementLots from './pages/procurement/ProcurementLots';
import AuctionFloor from './pages/procurement/AuctionFloor';

// Farmer Master Directory (Administrative)
import FarmerDirectory from './pages/farmers/FarmerDirectory';

// Payments & DBT
import PaymentOverview from './pages/payments/PaymentOverview';
import PendingPayments from './pages/payments/PendingPayments';
import PaymentHistory from './pages/payments/PaymentHistory';

// Documents
import DocumentCenter from './pages/documents/DocumentCenter';

// Reports & Analytics
import ReportsAnalytics from './pages/reports/ReportsAnalytics';

// Communication & Grievances
import NotificationsPage from './pages/communication/NotificationsPage';
import GrievanceFeedback from './pages/communication/GrievanceFeedback';

// Settings
import SystemSettings from './pages/settings/SystemSettings';

export default function App() {
  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Main Authenticated APMC App Shell */}
      <Route path="/" element={<AppLayout />}>
        {/* Index redirects to Dashboard */}
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* Dynamic Role Dashboard Dispatcher */}
        <Route path="dashboard" element={<DashboardDispatcher />} />

        {/* Specific Role Dashboards */}
        <Route path="dashboard/gate" element={<GateOperatorDashboard />} />
        <Route path="dashboard/weighbridge" element={<WeighbridgeDashboard />} />
        <Route path="dashboard/quality" element={<QualityAssayerDashboard />} />
        <Route path="dashboard/auction" element={<AuctionDashboard />} />
        <Route path="dashboard/procurement" element={<ProcurementDashboard />} />
        <Route path="dashboard/accounts" element={<AccountsDashboard />} />
        <Route path="dashboard/admin" element={<AdminDashboard />} />

        {/* Procurement Operations */}
        <Route path="procurement/overview" element={<ProcurementOverview />} />
        <Route path="procurement/centers" element={<CenterDiscovery />} />
        <Route path="procurement/schedules" element={<ScheduleSlots />} />
        <Route path="procurement/tokens" element={<DigitalTokens />} />
        <Route path="procurement/queue" element={<QueueManagement />} />
        <Route path="procurement/gate-entry" element={<GateEntry />} />
        <Route path="procurement/weighbridge" element={<Weighbridge defaultTab="scale" />} />
        <Route path="procurement/weighbridge/pending" element={<Weighbridge defaultTab="pending" />} />
        <Route path="procurement/weighbridge/history" element={<Weighbridge defaultTab="history" />} />
        <Route path="procurement/quality" element={<QualityAssay defaultTab="testing" />} />
        <Route path="procurement/quality/pending" element={<QualityAssay defaultTab="pending" />} />
        <Route path="procurement/quality/history" element={<QualityAssay defaultTab="history" />} />
        <Route path="procurement/lots" element={<ProcurementLots defaultTab="all" />} />
        <Route path="procurement/lots/approved" element={<ProcurementLots defaultTab="approved" />} />
        <Route path="procurement/auctions" element={<AuctionFloor defaultTab="live" />} />
        <Route path="procurement/auctions/history" element={<AuctionFloor defaultTab="history" />} />
        <Route path="procurement/auctions/completed" element={<AuctionFloor defaultTab="completed" />} />

        {/* Administrative Farmer Records */}
        <Route path="farmers" element={<FarmerDirectory />} />

        {/* Payments & Accounts */}
        <Route path="payments/overview" element={<PaymentOverview />} />
        <Route path="payments/pending" element={<PendingPayments />} />
        <Route path="payments/history" element={<PaymentHistory />} />

        {/* Document Printing & APMC Forms */}
        <Route path="documents" element={<DocumentCenter />} />
        <Route path="documents/tak-patti" element={<DocumentCenter defaultTab="tak-patti" />} />
        <Route path="documents/weighment-slips" element={<DocumentCenter defaultTab="weighment" />} />
        <Route path="documents/procurement-receipts" element={<DocumentCenter defaultTab="receipt" />} />
        <Route path="documents/payment-vouchers" element={<DocumentCenter defaultTab="payment" />} />
        <Route path="documents/gate-passes" element={<DocumentCenter defaultTab="gate-pass" />} />

        {/* Reports & Analytics */}
        <Route path="reports" element={<ReportsAnalytics />} />
        <Route path="reports/procurement" element={<ReportsAnalytics />} />
        <Route path="reports/centers" element={<ReportsAnalytics />} />

        {/* Communication & Grievances */}
        <Route path="communication/notifications" element={<NotificationsPage />} />
        <Route path="communication/feedback" element={<GrievanceFeedback />} />

        {/* System Settings & Configuration */}
        <Route path="settings" element={<SystemSettings />} />
        <Route path="settings/centers" element={<SystemSettings />} />
        <Route path="settings/crops" element={<SystemSettings />} />
        <Route path="settings/preferences" element={<SystemSettings />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
