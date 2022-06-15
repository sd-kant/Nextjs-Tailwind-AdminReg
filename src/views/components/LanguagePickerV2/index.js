import React, {useState} from "react";
import { useTranslation } from 'react-i18next'
import globeIcon from "../../../assets/images/globe.svg";
import clsx from "clsx";
import style from "./LanguagePickerV2.module.scss";

const LanguagePickerV2 = () => {
  const { i18n } = useTranslation();
  const [lang, setLang] = useState(localStorage.getItem("kop-v2-lang") || "en");
  const changeLanguageHandler = (lang) =>
  {
    i18n.changeLanguage(lang);
    setLang(lang);
    localStorage.setItem("kop-v2-lang", lang);
    // window.location.reload();
  };

  return (
    <div className={clsx(style.LangPicker)}>
      <img src={globeIcon} className={clsx(style.Img)} alt="globe icon"/>
      {/* eslint-disable-next-line jsx-a11y/no-onchange */}
      <select
        className={clsx("font-input-label text-white")}
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
        <option value="es">
          Español
        </option>
      </select>
    </div>
  )
}

export default LanguagePickerV2;