import React, {useState} from "react";
import { useTranslation } from 'react-i18next'
import globeIcon from "../../assets/images/globe.svg";

const LanguagePicker = () => {
  const { i18n } = useTranslation();
  const [lang, setLang] = useState(localStorage.getItem("kop-v2-lang") || "en");
  const changeLanguageHandler = (lang) =>
  {
    i18n.changeLanguage(lang);
    setLang(lang);
    localStorage.setItem("kop-v2-lang", lang);
    window.location.reload();
  };

  return (
    <div className="lang-picker">
      <img src={globeIcon} alt="globe icon"/>
      <select
        className="font-input-label text-white"
        onChange={(e) => changeLanguageHandler(e.target.value)}
        value={lang}
      >
        <option value="en">
          English
        </option>
        <option value="ja">
          日本語
        </option>
        <option value="fr">
          Français
        </option>
        <option value="frca">
          Ca-français
        </option>
      </select>
    </div>
  )
}

export default LanguagePicker;