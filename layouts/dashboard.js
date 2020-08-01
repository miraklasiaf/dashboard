import { Dashboard } from '@/components/dashboard';

const DashboardLayout = ({ children }) => <Dashboard>{children}</Dashboard>;

export const getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default DashboardLayout;
