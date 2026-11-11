/**
 * Request validation utilities and middleware.
 */

const VALID_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function validateBloodGroup(bloodGroup) {
  return VALID_BLOOD_GROUPS.includes(bloodGroup);
}

function validateInventoryBatch(req, res, next) {
  const { bloodGroup, units, collectionDate, expiryDate } = req.body;
  const errors = [];

  if (!bloodGroup || !validateBloodGroup(bloodGroup)) {
    errors.push(`Invalid bloodGroup. Allowed values: ${VALID_BLOOD_GROUPS.join(', ')}`);
  }

  if (units === undefined || isNaN(Number(units)) || Number(units) < 0) {
    errors.push('units must be a non-negative number');
  }

  if (!collectionDate) {
    errors.push('collectionDate is required (YYYY-MM-DD)');
  }

  if (!expiryDate) {
    errors.push('expiryDate is required (YYYY-MM-DD)');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
}

function validateDonor(req, res, next) {
  const { fullName, age, gender, bloodGroup, contactPhone } = req.body;
  const errors = [];

  if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
    errors.push('fullName is required');
  }

  if (age === undefined || isNaN(Number(age)) || Number(age) < 18 || Number(age) > 65) {
    errors.push('age must be a number between 18 and 65 for donor eligibility');
  }

  if (!gender) {
    errors.push('gender is required');
  }

  if (!bloodGroup || !validateBloodGroup(bloodGroup)) {
    errors.push(`Invalid bloodGroup. Allowed values: ${VALID_BLOOD_GROUPS.join(', ')}`);
  }

  if (!contactPhone) {
    errors.push('contactPhone is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
}

function validateRequest(req, res, next) {
  const { patientName, hospitalName, bloodGroup, units, contactPhone } = req.body;
  const errors = [];

  if (!patientName || !patientName.trim()) {
    errors.push('patientName is required');
  }

  if (!hospitalName || !hospitalName.trim()) {
    errors.push('hospitalName is required');
  }

  if (!bloodGroup || !validateBloodGroup(bloodGroup)) {
    errors.push(`Invalid bloodGroup. Allowed values: ${VALID_BLOOD_GROUPS.join(', ')}`);
  }

  if (units === undefined || isNaN(Number(units)) || Number(units) <= 0) {
    errors.push('units must be a positive number');
  }

  if (!contactPhone) {
    errors.push('contactPhone is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
}

function validateDonation(req, res, next) {
  const { donorName, bloodGroup, donationDate } = req.body;
  const errors = [];

  if (!donorName) {
    errors.push('donorName is required');
  }

  if (!bloodGroup || !validateBloodGroup(bloodGroup)) {
    errors.push(`Invalid bloodGroup. Allowed values: ${VALID_BLOOD_GROUPS.join(', ')}`);
  }

  if (!donationDate) {
    errors.push('donationDate is required (YYYY-MM-DD)');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
}

module.exports = {
  VALID_BLOOD_GROUPS,
  validateBloodGroup,
  validateInventoryBatch,
  validateDonor,
  validateRequest,
  validateDonation
};
