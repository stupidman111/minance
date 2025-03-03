import { Suspense } from "react";
import { ScaleLoader } from "react-spinners";

function DashboardLayout({ children }) {
  return (
    <div className="px-5">
      <h1 className="text-6xl font-bold gradient-title mb-5">Dashboard</h1>

      <Suspense
        fallback={
          <ScaleLoader className="mt-4" width={"100%"} color="#9333ea" />
        }
      >
        {children}
      </Suspense>
    </div>
  );
}

export default DashboardLayout;
