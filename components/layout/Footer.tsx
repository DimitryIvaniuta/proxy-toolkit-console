export function Footer() {
  return (
    <footer className="h-12 border-t bg-white flex items-center px-4 text-xs text-slate-600">
      <div>© {new Date().getFullYear()} Proxy Toolkit Console</div>
      <div className="ml-auto">Backend: Spring Proxy Toolkit</div>
    </footer>
  );
}
