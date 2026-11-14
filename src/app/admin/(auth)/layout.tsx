import { AuthHeader, AuthFooter } from "../_components/nav";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthHeader />
      <main id="main">
        <div className="wrap">
          <div
            className="page"
            style={{
              maxWidth: "420px",
              marginInline: "auto",
              minHeight: "calc(100dvh - 220px)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "24px",
            }}
          >
            {children}
          </div>
        </div>
      </main>
      <AuthFooter />
    </>
  );
}
