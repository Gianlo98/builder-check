import { Suspense } from "react";
import { ReportContent } from "./report-content";

export default function ReportPage() {
  return (
    <Suspense>
      <ReportContent />
    </Suspense>
  );
}
