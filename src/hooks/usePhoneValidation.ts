import { parsePhoneNumberFromString } from 'libphonenumber-js';

export function validateHungarianPhone(value: string): string | null {
    const phoneNumber = parsePhoneNumberFromString(value, 'HU');
    if (!phoneNumber || !phoneNumber.isValid()) {
        return null;
    }
    return phoneNumber.formatInternational();
}
