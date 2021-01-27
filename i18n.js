import I18n from 'react-native-i18n';
import ar from './src/assets/translations/ar';
import tr from './src/assets/translations/tr';
import en from './src/assets/translations/en';

I18n.defaultLocale = 'en'
I18n.fallbacks = true;
I18n.translations = {
  ar: ar,
  tr: tr,
  en: en,
};

export default I18n;
