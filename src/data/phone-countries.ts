import { PhoneCountry } from './types';

// GCC countries + Egypt
export const phoneCountries: PhoneCountry[] = [
  {
    code: 'SA',
    name: 'Saudi Arabia',
    nameAr: 'السعودية',
    dialCode: '+966',
    flag: '🇸🇦',
    placeholder: '5XXXXXXXX',
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    nameAr: 'الإمارات',
    dialCode: '+971',
    flag: '🇦🇪',
    placeholder: '5XXXXXXXX',
  },
  {
    code: 'KW',
    name: 'Kuwait',
    nameAr: 'الكويت',
    dialCode: '+965',
    flag: '🇰🇼',
    placeholder: '9XXXXXXX',
  },
  {
    code: 'QA',
    name: 'Qatar',
    nameAr: 'قطر',
    dialCode: '+974',
    flag: '🇶🇦',
    placeholder: '3XXXXXXX',
  },
  {
    code: 'BH',
    name: 'Bahrain',
    nameAr: 'البحرين',
    dialCode: '+973',
    flag: '🇧🇭',
    placeholder: '3XXXXXXX',
  },
  {
    code: 'OM',
    name: 'Oman',
    nameAr: 'عُمان',
    dialCode: '+968',
    flag: '🇴🇲',
    placeholder: '9XXXXXXX',
  },
  {
    code: 'EG',
    name: 'Egypt',
    nameAr: 'مصر',
    dialCode: '+20',
    flag: '🇪🇬',
    placeholder: '10XXXXXXXX',
  },
];

export function getCountryByCode(code: string): PhoneCountry | undefined {
  return phoneCountries.find(c => c.code === code);
}

export function getCountryByDialCode(dialCode: string): PhoneCountry | undefined {
  return phoneCountries.find(c => c.dialCode === dialCode);
}
