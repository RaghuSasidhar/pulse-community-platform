import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import { submitReport } from "@/lib/pulse-data.functions";

export type Role = "citizen" | "doctor" | "volunteer" | "lab" | "pharmacy";

export const roleLabels: Record<Role, string> = {
  citizen: "General Citizen",
  doctor: "Doctor",
  volunteer: "Volunteer / ASHA",
  lab: "Laboratory",
  pharmacy: "Pharmacy",
};

export const roleReportPath: Record<Role, string> = {
  citizen: "/report/citizen",
  doctor: "/report/doctor",
  volunteer: "/report/volunteer",
  lab: "/report/lab",
  pharmacy: "/report/pharmacy",
};

export type Session = {
  role: Role;
  displayName: string;
  credential: string;
  verifiedAt: string;
};

export type SubmittedReport = {
  id: string;
  role: Role;
  zoneId: string;
  zoneName: string;
  title: string;
  details: string[];
  submittedAt: string;
};

export type Language = "en" | "hi" | "mr";

const STORAGE_KEY = "pulse.session.v1";
const REPORTS_KEY = "pulse.reports.v1";
const LANG_KEY = "pulse.lang.v1";

type PulseContextValue = {
  hydrated: boolean;
  session: Session | null;
  signIn: (session: Omit<Session, "verifiedAt">) => void;
  signOut: () => void;
  reports: SubmittedReport[];
  addReport: (report: Omit<SubmittedReport, "id" | "submittedAt">) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const PulseContext = createContext<PulseContextValue | null>(null);

const dictionary: Record<Language, Record<string, string>> = {
  en: {
    "nav.dashboard": "Dashboard",
    "nav.about": "About",
    "nav.privacy": "Privacy",
    "nav.faq": "FAQ",
    "nav.officials": "Officials",
    "nav.myReports": "My reports",
    "nav.signOut": "Sign out",
    "cta.report": "Report an issue in your area",
    "dash.title": "Community health signal map",
    "dash.subtitle":
      "Area-level illness patterns from everyday reports. Never a diagnosis.",
    "dash.legend": "Severity",
    "dash.zones": "Zones",
    "dash.locate": "Use my location",
    "severity.low": "Low",
    "severity.moderate": "Moderate",
    "severity.high": "High",
    "severity.critical": "Critical",
    "disclaimer":
      "Pulse shows area-level patterns only. It never diagnoses individuals and does not replace official disease notification.",
  },
  hi: {
    "nav.dashboard": "डैशबोर्ड",
    "nav.about": "परिचय",
    "nav.privacy": "गोपनीयता",
    "nav.faq": "सामान्य प्रश्न",
    "nav.officials": "अधिकारी",
    "nav.myReports": "मेरी रिपोर्ट",
    "nav.signOut": "साइन आउट",
    "cta.report": "अपने क्षेत्र की जानकारी दें",
    "dash.title": "सामुदायिक स्वास्थ्य संकेत मानचित्र",
    "dash.subtitle":
      "रोज़मर्रा की रिपोर्टों से क्षेत्र-स्तरीय बीमारी के संकेत। यह निदान नहीं है।",
    "dash.legend": "गंभीरता",
    "dash.zones": "क्षेत्र",
    "dash.locate": "मेरा स्थान उपयोग करें",
    "severity.low": "कम",
    "severity.moderate": "मध्यम",
    "severity.high": "उच्च",
    "severity.critical": "गंभीर",
    "disclaimer":
      "पल्स केवल क्षेत्र-स्तरीय पैटर्न दिखाता है। यह किसी व्यक्ति का निदान नहीं करता।",
  },
  mr: {
    "nav.dashboard": "डॅशबोर्ड",
    "nav.about": "माहिती",
    "nav.privacy": "गोपनीयता",
    "nav.faq": "प्रश्न",
    "nav.officials": "अधिकारी",
    "nav.myReports": "माझे अहवाल",
    "nav.signOut": "साइन आऊट",
    "cta.report": "तुमच्या भागातील माहिती द्या",
    "dash.title": "सामुदायिक आरोग्य संकेत नकाशा",
    "dash.subtitle":
      "दैनंदिन अहवालांवरून क्षेत्रनिहाय आजाराचे संकेत. हे निदान नाही.",
    "dash.legend": "तीव्रता",
    "dash.zones": "क्षेत्रे",
    "dash.locate": "माझे ठिकाण वापरा",
    "severity.low": "कमी",
    "severity.moderate": "मध्यम",
    "severity.high": "जास्त",
    "severity.critical": "गंभीर",
    "disclaimer":
      "पल्स फक्त क्षेत्रनिहाय नमुने दाखवते. ते व्यक्तीचे निदान करत नाही.",
  },
};

export function PulseProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [hydrated, setHydrated] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [reports, setReports] = useState<SubmittedReport[]>([]);
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setSession(JSON.parse(raw) as Session);
      const rawReports = sessionStorage.getItem(REPORTS_KEY);
      if (rawReports) setReports(JSON.parse(rawReports) as SubmittedReport[]);
      const lang = localStorage.getItem(LANG_KEY) as Language | null;
      if (lang && lang in dictionary) setLanguageState(lang);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  const signIn = useCallback((next: Omit<Session, "verifiedAt">) => {
    const value: Session = { ...next, verifiedAt: new Date().toISOString() };
    setSession(value);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }, []);

  const signOut = useCallback(() => {
    setSession(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const addReport = useCallback(
    (report: Omit<SubmittedReport, "id" | "submittedAt">) => {
      setReports((prev) => {
        const next = [
          {
            ...report,
            id: `r-${Date.now()}-${prev.length}`,
            submittedAt: new Date().toISOString(),
          },
          ...prev,
        ];
        try {
          sessionStorage.setItem(REPORTS_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });

      // Save to the shared database so the map reflects it for everyone.
      void submitReport({
        data: {
          zoneId: report.zoneId,
          role: report.role,
          title: report.title,
          details: report.details,
        },
      })
        .then(() => {
          void queryClient.invalidateQueries({ queryKey: ["zones"] });
        })
        .catch(() => {
          toast.error("Saved locally, but we could not reach the server.");
        });
    },
    [queryClient],
  );

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (key: string) => dictionary[language][key] ?? dictionary.en[key] ?? key,
    [language],
  );

  const value = useMemo(
    () => ({
      hydrated,
      session,
      signIn,
      signOut,
      reports,
      addReport,
      language,
      setLanguage,
      t,
    }),
    [hydrated, session, signIn, signOut, reports, addReport, language, setLanguage, t],
  );

  return <PulseContext.Provider value={value}>{children}</PulseContext.Provider>;
}

export function usePulse() {
  const ctx = useContext(PulseContext);
  if (!ctx) throw new Error("usePulse must be used inside PulseProvider");
  return ctx;
}
