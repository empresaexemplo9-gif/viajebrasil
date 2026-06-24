export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="container-app flex flex-col items-center justify-between gap-3 py-8 text-sm text-slate-500 sm:flex-row">
        <p className="font-semibold text-tinta">
          DRAP <span className="text-marca-600">Business</span>
        </p>
        <p>Hub digital de negócios e conexões — MVP.</p>
        <p>© {new Date().getFullYear()} DRAP Business</p>
      </div>
    </footer>
  );
}
