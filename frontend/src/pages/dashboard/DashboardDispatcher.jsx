import { Navigate } from 'react-router-dom';
import { useProcurement } from '../../context/ProcurementContext';

export default function DashboardDispatcher() {
  const { activeRoleObj } = useProcurement();
  return <Navigate to={activeRoleObj?.dashboardPath || '/dashboard/gate'} replace />;
}

