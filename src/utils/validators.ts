// List of Canadian Area Codes (NANP)
// Source: Updated based on 2024/2025 official CNAC data
const CANADIAN_AREA_CODES = new Set([
  // Alberta
  '368', '403', '568', '587', '780', '825',
  // British Columbia
  '236', '250', '257', '604', '672', '778',
  // Manitoba
  '204', '431', '584',
  // New Brunswick
  '428', '506',
  // Newfoundland and Labrador
  '709', '879',
  // Northwest Territories
  '867',
  // Nova Scotia
  '782', '851', '902',
  // Nunavut
  '867',
  // Ontario
  '226', '249', '289', '343', '365', '382', '387', '416', '437', '460', 
  '519', '537', '548', '613', '647', '683', '705', '742', '753', '807', 
  '905', '942',
  // Prince Edward Island
  '782', '902',
  // Quebec
  '263', '354', '367', '368', '418', '438', '450', '468', '514', '579', 
  '581', '819', '873',
  // Saskatchewan
  '306', '474', '639',
  // Yukon
  '867'
]);

/**
 * Validates if a phone number has the correct format (+1 followed by exactly 10 digits).
 */
export const isValidPhoneFormat = (phone: string): boolean => {
  return /^\+1\d{10}$/.test(phone);
};

/**
 * Validates if a phone number is a valid Canadian number.
 * Assumes format has already been validated (+1 followed by 10 digits).
 */
export const isCanadianPhoneNumber = (phone: string): boolean => {
  // Extract area code (digits 2-4 after +1)
  const areaCode = phone.slice(2, 5);
  return CANADIAN_AREA_CODES.has(areaCode);
};
