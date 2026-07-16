import { requireUser } from "@/server/auth";
import { AppHeader } from "@/components/app-header";
import { ToastProvider } from "@/components/ui/toast";

/** Layout area terautentikasi. Middleware sudah menjaga rute ini. */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <ToastProvider>
      <div className="app-canvas flex min-h-full flex-col">
        <a
          href="#main-content"
          className="fixed left-4 top-3 z-[100] -translate-y-20 rounded-2xl bg-teal-800 px-4 py-3 text-[14px] font-semibold text-white shadow-[0_18px_50px_rgba(15,118,110,0.12)] transition-transform focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-white"
        >
          Lewati ke konten utama
        </a>
        <AppHeader userName={user.name} />
        <main id="main-content" tabIndex={-1} className="flex flex-1 flex-col">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
