import React, { createContext, useEffect, useState } from 'react';
import i18n from '../src/i18n';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children, api }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en');

  const changeLanguage = async (lng) => {
    try {
      const res = await api.apiGet(`/translations`, { params: { lang: lng } });
      const data = res.data;

      i18n.addResourceBundle(lng, 'translation', data.messages, true, true);
      i18n.changeLanguage(lng);

      setLang(lng);
      localStorage.setItem('lang', lng);
    } catch (err) {
      console.error('Failed to load language', err);
    }
  };

  useEffect(() => {
    changeLanguage(lang);
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
