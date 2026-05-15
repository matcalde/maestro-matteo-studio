import { Shield } from "lucide-react";

export default function PrivacyBanner() {
  return (
    <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-3 text-sm flex gap-3 items-start">
      <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
      <div>
        <strong>I tuoi dati restano in questa scheda.</strong> Niente server, niente database, niente tracking.
        Chiusa la scheda i materiali si perdono — scaricali in PDF o Word per conservarli.
      </div>
    </div>
  );
}
