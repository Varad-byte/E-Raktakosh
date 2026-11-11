/**
 * Initial Realistic Seed Data conforming to e-RaktKosh standards.
 * Matches exact structures expected by the BBIMS frontend.
 */

const getRelativeDate = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

const getInitialData = () => {
  const settings = {
    lowStockThreshold: 5,
    nearExpiryDaysThreshold: 7,
    facilityName: 'Central Regional Blood Centre (e-RaktKosh Partner)',
    licenseNumber: 'DL-BB-2024-0981',
    nodalOfficer: 'Dr. Amit Roy',
    contactPhone: '+91 11 2345 6789'
  };

  const inventory = [
    { id: 'BAT-1001', bloodGroup: 'A+', units: 8, collectionDate: getRelativeDate(-15), expiryDate: getRelativeDate(20), donorId: 'DNR-101', notes: 'Vault 1, Rack A' },
    { id: 'BAT-1002', bloodGroup: 'A-', units: 3, collectionDate: getRelativeDate(-28), expiryDate: getRelativeDate(7), donorId: 'DNR-105', notes: 'Vault 1, Rack B (Near Expiry)' },
    { id: 'BAT-1003', bloodGroup: 'B+', units: 12, collectionDate: getRelativeDate(-10), expiryDate: getRelativeDate(25), donorId: 'DNR-102', notes: 'Vault 2, Rack A' },
    { id: 'BAT-1004', bloodGroup: 'B-', units: 4, collectionDate: getRelativeDate(-25), expiryDate: getRelativeDate(10), donorId: 'DNR-108', notes: 'Vault 2, Rack B' },
    { id: 'BAT-1005', bloodGroup: 'AB+', units: 6, collectionDate: getRelativeDate(-12), expiryDate: getRelativeDate(23), donorId: 'DNR-104', notes: 'Vault 3, Rack A' },
    { id: 'BAT-1006', bloodGroup: 'AB-', units: 2, collectionDate: getRelativeDate(-31), expiryDate: getRelativeDate(4), donorId: 'DNR-107', notes: 'Vault 3, Rack B (Near Expiry)' },
    { id: 'BAT-1007', bloodGroup: 'O+', units: 14, collectionDate: getRelativeDate(-8), expiryDate: getRelativeDate(27), donorId: 'DNR-103', notes: 'Vault 4, Rack A' },
    { id: 'BAT-1008', bloodGroup: 'O-', units: 3, collectionDate: getRelativeDate(-20), expiryDate: getRelativeDate(15), donorId: 'DNR-106', notes: 'Vault 4, Universal Donor Rack' },
    { id: 'BAT-1009', bloodGroup: 'A+', units: 5, collectionDate: getRelativeDate(-5), expiryDate: getRelativeDate(30), donorId: 'DNR-109', notes: 'Vault 1, Mobile Camp Batch' }
  ];

  const donors = [
    { id: 'DNR-101', fullName: 'Rajesh Sharma', age: 29, gender: 'Male', bloodGroup: 'A+', contactPhone: '9876543210', city: 'New Delhi', lastDonationDate: getRelativeDate(-15) },
    { id: 'DNR-102', fullName: 'Priya Sundaram', age: 34, gender: 'Female', bloodGroup: 'B+', contactPhone: '9812345678', city: 'Bengaluru', lastDonationDate: getRelativeDate(-10) },
    { id: 'DNR-103', fullName: 'Vikramaditya Roy', age: 41, gender: 'Male', bloodGroup: 'O+', contactPhone: '9765432109', city: 'Kolkata', lastDonationDate: getRelativeDate(-8) },
    { id: 'DNR-104', fullName: 'Ananya Deshmukh', age: 26, gender: 'Female', bloodGroup: 'AB+', contactPhone: '9823456781', city: 'Mumbai', lastDonationDate: getRelativeDate(-12) },
    { id: 'DNR-105', fullName: 'Kavita Nair', age: 31, gender: 'Female', bloodGroup: 'A-', contactPhone: '9834567812', city: 'Chennai', lastDonationDate: getRelativeDate(-120) },
    { id: 'DNR-106', fullName: 'Arjun Mehra', age: 38, gender: 'Male', bloodGroup: 'O-', contactPhone: '9845678123', city: 'Hyderabad', lastDonationDate: getRelativeDate(-100) },
    { id: 'DNR-107', fullName: 'Mohammed Tariq', age: 24, gender: 'Male', bloodGroup: 'AB-', contactPhone: '9856781234', city: 'Lucknow', lastDonationDate: getRelativeDate(-140) },
    { id: 'DNR-108', fullName: 'Sunita Gill', age: 45, gender: 'Female', bloodGroup: 'B-', contactPhone: '9867812345', city: 'Chandigarh', lastDonationDate: getRelativeDate(-25) },
    { id: 'DNR-109', fullName: 'Rohan Gupta', age: 22, gender: 'Male', bloodGroup: 'A+', contactPhone: '9878901234', city: 'Jaipur', lastDonationDate: getRelativeDate(-5) }
  ];

  const requests = [
    { id: 'REQ-501', patientName: 'Suresh Kumar', hospitalName: 'AIIMS New Delhi', bloodGroup: 'A+', units: 2, contactPhone: '9811223344', requestDate: getRelativeDate(-1), status: 'Approved' },
    { id: 'REQ-502', patientName: 'Meera Patel', hospitalName: 'Apollo Hospital', bloodGroup: 'O-', units: 1, contactPhone: '9822334455', requestDate: getRelativeDate(-2), status: 'Pending' },
    { id: 'REQ-503', patientName: 'Deepak Verma', hospitalName: 'Max Super Speciality Hospital', bloodGroup: 'B+', units: 3, contactPhone: '9833445566', requestDate: getRelativeDate(-3), status: 'Fulfilled' },
    { id: 'REQ-504', patientName: 'Gurpreet Singh', hospitalName: 'Fortis Healthcare', bloodGroup: 'AB-', units: 1, contactPhone: '9844556677', requestDate: getRelativeDate(-4), status: 'Pending' },
    { id: 'REQ-505', patientName: 'Fatima Sheikh', hospitalName: 'Safdarjung Hospital', bloodGroup: 'A-', units: 2, contactPhone: '9855667788', requestDate: getRelativeDate(-5), status: 'Fulfilled' },
    { id: 'REQ-506', patientName: 'Ramesh Reddy', hospitalName: 'Sir Ganga Ram Hospital', bloodGroup: 'O+', units: 4, contactPhone: '9866778899', requestDate: getRelativeDate(-7), status: 'Rejected' }
  ];

  const donations = [
    { id: 'DON-201', donorId: 'DNR-101', donorName: 'Rajesh Sharma', bloodGroup: 'A+', units: 1, donationDate: getRelativeDate(-15), status: 'Completed' },
    { id: 'DON-202', donorId: 'DNR-102', donorName: 'Priya Sundaram', bloodGroup: 'B+', units: 1, donationDate: getRelativeDate(-10), status: 'Completed' },
    { id: 'DON-203', donorId: 'DNR-103', donorName: 'Vikramaditya Roy', bloodGroup: 'O+', units: 1, donationDate: getRelativeDate(-8), status: 'Completed' },
    { id: 'DON-204', donorId: 'DNR-104', donorName: 'Ananya Deshmukh', bloodGroup: 'AB+', units: 1, donationDate: getRelativeDate(-12), status: 'Completed' },
    { id: 'DON-205', donorId: 'DNR-109', donorName: 'Rohan Gupta', bloodGroup: 'A+', units: 1, donationDate: getRelativeDate(-5), status: 'Completed' },
    { id: 'DON-206', donorId: 'DNR-108', donorName: 'Sunita Gill', bloodGroup: 'B-', units: 1, donationDate: getRelativeDate(-25), status: 'Under Testing' }
  ];

  return { settings, inventory, donors, requests, donations };
};

module.exports = {
  getInitialData,
  getRelativeDate
};
