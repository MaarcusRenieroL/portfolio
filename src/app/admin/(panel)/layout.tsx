import { requireAdmin } from "~/lib/server/session";
import { AdminHeader, AdminFooter } from "../_components/nav";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <>
      <AdminHeader />
      <main id="main">
        <div className="wrap admin-wrap">
          <div className="page admin-page">
            {children}
          </div>
        </div>
      </main>
      <AdminFooter />
    </>
  );
}
