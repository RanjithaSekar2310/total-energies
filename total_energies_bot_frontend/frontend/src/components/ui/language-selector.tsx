import { useState } from "react";
import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Language {
  code: string;
  name: string;
  flag: string;
  rtl?: boolean;
}

const languages: Language[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ar", name: "العربية", flag: "🇸🇦", rtl: true },
  { code: "fa", name: "فارسی", flag: "🇮🇷", rtl: true },
  // { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  // { code: "de", name: "Deutsch", flag: "🇩🇪" },
  // { code: "it", name: "Italiano", flag: "🇮🇹" },
  // { code: "pt", name: "Português", flag: "🇵🇹" },
  // { code: "ru", name: "Русский", flag: "🇷🇺" },
  // { code: "zh", name: "中文", flag: "🇨🇳" },
  // { code: "ja", name: "日本語", flag: "🇯🇵" },
  // { code: "ko", name: "한국어", flag: "🇰🇷" },
  // { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
  // { code: "tr", name: "Türkçe", flag: "🇹🇷" }
];

export function LanguageSelector() {
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const handleLanguageChange = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    const selectedLang = languages.find((lang) => lang.code === languageCode);

    // Apply RTL direction for Arabic and Persian
    if (selectedLang?.rtl) {
      // document.documentElement.dir = "rtl";
      document.documentElement.lang = languageCode;
    } else {
      // document.documentElement.dir = "ltr";
      document.documentElement.lang = languageCode;
    }

    console.log(`Language changed to: ${selectedLang?.name}`);
  };

  const currentLanguage = languages.find(
    (lang) => lang.code === selectedLanguage
  );

  return (
    <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-auto min-w-[120px] bg-background/80 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-colors">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{currentLanguage?.flag}</span>
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent className="bg-background/95 backdrop-blur-sm border border-border/50">
        {languages.map((language) => (
          <SelectItem
            key={language.code}
            value={language.code}
            className="hover:bg-primary/10 focus:bg-primary/10 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              {/* <span className="text-lg">{language.flag}</span> */}
              <span className="text-sm font-medium">{language.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
