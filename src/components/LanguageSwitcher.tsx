import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { SUPPORTED_LANGUAGES } from "@/i18n/config";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  return (
    <div className="flex items-center gap-1.5">
      <Globe className="h-4 w-4 text-foreground/60" />
      <Select value={i18n.language.split("-")[0]} onValueChange={(v) => i18n.changeLanguage(v)}>
        <SelectTrigger className="h-8 w-[140px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-72">
          {SUPPORTED_LANGUAGES.map((l) => (
            <SelectItem key={l.code} value={l.code}>
              {l.native} <span className="text-muted-foreground">({l.label})</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSwitcher;