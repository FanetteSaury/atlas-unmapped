export function HonestLimitsBanner({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="rounded-md border border-amber-200/60 bg-amber-50/60 px-3 py-1.5 text-[11px] text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
        ⚠️ Hackathon-grade rubrics, calibrated against Ghana 2013 STEP. Not psychometrically validated.
      </div>
    );
  }
  return (
    <aside className="rounded-lg border border-amber-200/60 bg-amber-50/40 p-4 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
      <div className="font-semibold">Honest about limits</div>
      <p className="mt-1 text-xs leading-relaxed">
        Atlas v0 uses hackathon-grade STEP-equivalent rubrics, calibrated against Ghana 2013 STEP anchors but{" "}
        <strong>not psychometrically validated</strong>. Production calibration requires 1000+ players × 6 months of IRT
        work. Scores are directional, not absolute. LMIC econometrics are real (sources cited inline).
      </p>
    </aside>
  );
}
