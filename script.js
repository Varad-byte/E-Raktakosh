/**
 * ==============================================================================
 * BLOOD BANK INVENTORY MANAGEMENT SYSTEM (BBIMS)
 * Frontend Logic, State Management, and Simulated API Layer
 * ==============================================================================
 * 
 * TABLE OF CONTENTS:
 * 1. BACKEND INTEGRATION PREPARATION & PLACEHOLDER API LAYER
 * 2. INITIAL REALISTIC SAMPLE / DEMO DATA
 * 3. STATE INITIALIZATION & LOCALSTORAGE MANAGEMENT
 * 4. NOTIFICATION & TOAST MESSAGING SYSTEM
 * 5. NAVIGATION & VIEW SWITCHING
 * 6. MODULE 1: DASHBOARD RENDERER & LOGIC
 * 7. MODULE 2: BLOOD INVENTORY MANAGEMENT (BATCH LEVEL)
 * 8. MODULE 3: DONOR MANAGEMENT & ELIGIBILITY CALCULATOR
 * 9. MODULE 4: BLOOD REQUEST MANAGEMENT & STATUS UPDATES
 * 10. MODULE 5: DONATION RECORDS
 * 11. MODULE 6: REPORTS & AUDIT SUMMARY
 * 12. MODULE 7: SETTINGS & FACILITY PREFERENCES
 * 13. MODALS, FORMS, AND POPUP INTERACTIONS
 * 14. UTILITIES (CSV EXPORT, DATE FORMATTING, COMPATIBILITY)
 * 15. DOM READY BOOTSTRAPPER
 * ==============================================================================
 */

/* ==============================================================================
   SECTION 1: BACKEND INTEGRATION PREPARATION & PLACEHOLDER API LAYER
   ==============================================================================
   NOTE FOR BACKEND DEVELOPER:
   - This entire section acts as the client-side API Service layer.
   - All backend API endpoints and base URL are centralized in `API_CONFIG`.
   - Currently, these functions use `localStorage` to simulate persistence so that
     the frontend runs 100% locally out-of-the-box without requiring a live server.
   - When connecting your backend (e.g. Node.js/Express, Python/FastAPI, or Java/Spring):
     1. Update `API_CONFIG.BASE_URL` with your actual server host and port.
     2. Confirm endpoint URLs, request payload structures, and response JSON formats.
     3. In each async function below, uncomment the marked `fetch()` call and remove
        the `localStorage` simulation.
   ============================================================================== */

const API_CONFIG = {
  // Base URL for the backend API
  BASE_URL: (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin !== 'null' && !window.location.origin.startsWith('file:'))
    ? `${window.location.origin}/api` 
    : 'http://localhost:5000/api',

  // Proposed placeholder endpoints (Confirm with backend team)
  ENDPOINTS: {
    inventory: '/inventory',
    donors: '/donors',
    requests: '/requests',
    donations: '/donations',
    settings: '/settings',
  },

  // Simulated network latency (in milliseconds) for realistic local demonstration
  SIMULATED_DELAY_MS: 50
};

/**
 * Helper to simulate network latency for async operations
 */
const simulateNetworkDelay = () => 
  new Promise(resolve => setTimeout(resolve, API_CONFIG.SIMULATED_DELAY_MS));

/**
 * Centralized API Service
 * Every function is async/await ready for direct transition to REST/GraphQL APIs.
 */
const apiService = {

  // --- BLOOD INVENTORY API ---

  async getInventory() {
    await simulateNetworkDelay();
    // FUTURE BACKEND INTEGRATION:
    // const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.inventory}`);
    // return await res.json();
    return db.getInventory();
  },

  async addInventoryBatch(batchData) {
    await simulateNetworkDelay();
    // FUTURE BACKEND INTEGRATION:
    // const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.inventory}`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(batchData)
    // });
    // return await res.json();
    return db.addInventoryBatch(batchData);
  },

  async updateInventoryBatch(id, updatedData) {
    await simulateNetworkDelay();
    // FUTURE BACKEND INTEGRATION:
    // const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.inventory}/${id}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(updatedData)
    // });
    // return await res.json();
    return db.updateInventoryBatch(id, updatedData);
  },

  async deleteInventoryBatch(id) {
    await simulateNetworkDelay();
    // FUTURE BACKEND INTEGRATION:
    // await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.inventory}/${id}`, { method: 'DELETE' });
    return db.deleteInventoryBatch(id);
  },

  // --- DONORS API ---

  async getDonors() {
    await simulateNetworkDelay();
    // FUTURE BACKEND INTEGRATION:
    // const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.donors}`);
    // return await res.json();
    return db.getDonors();
  },

  async addDonor(donorData) {
    await simulateNetworkDelay();
    // FUTURE BACKEND INTEGRATION:
    // const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.donors}`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(donorData)
    // });
    // return await res.json();
    return db.addDonor(donorData);
  },

  async updateDonor(id, updatedData) {
    await simulateNetworkDelay();
    // FUTURE BACKEND INTEGRATION:
    // const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.donors}/${id}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(updatedData)
    // });
    // return await res.json();
    return db.updateDonor(id, updatedData);
  },

  async deleteDonor(id) {
    await simulateNetworkDelay();
    // FUTURE BACKEND INTEGRATION:
    // await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.donors}/${id}`, { method: 'DELETE' });
    return db.deleteDonor(id);
  },

  // --- BLOOD REQUESTS API ---

  async getRequests() {
    await simulateNetworkDelay();
    // FUTURE BACKEND INTEGRATION:
    // const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.requests}`);
    // return await res.json();
    return db.getRequests();
  },

  async addRequest(requestData) {
    await simulateNetworkDelay();
    // FUTURE BACKEND INTEGRATION:
    // const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.requests}`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(requestData)
    // });
    // return await res.json();
    return db.addRequest(requestData);
  },

  async updateRequestStatus(id, newStatus) {
    await simulateNetworkDelay();
    // FUTURE BACKEND INTEGRATION:
    // const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.requests}/${id}/status`, {
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ status: newStatus })
    // });
    // return await res.json();
    return db.updateRequestStatus(id, newStatus);
  },

  async deleteRequest(id) {
    await simulateNetworkDelay();
    // FUTURE BACKEND INTEGRATION:
    // await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.requests}/${id}`, { method: 'DELETE' });
    return db.deleteRequest(id);
  },

  // --- DONATION RECORDS API ---

  async getDonations() {
    await simulateNetworkDelay();
    // FUTURE BACKEND INTEGRATION:
    // const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.donations}`);
    // return await res.json();
    return db.getDonations();
  },

  async addDonation(donationData) {
    await simulateNetworkDelay();
    // FUTURE BACKEND INTEGRATION:
    // const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.donations}`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(donationData)
    // });
    // return await res.json();
    return db.addDonation(donationData);
  },

  async deleteDonation(id) {
    await simulateNetworkDelay();
    // FUTURE BACKEND INTEGRATION:
    // await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.donations}/${id}`, { method: 'DELETE' });
    return db.deleteDonation(id);
  },

  // --- SETTINGS API ---

  async getSettings() {
    await simulateNetworkDelay();
    // FUTURE BACKEND INTEGRATION:
    // const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.settings}`);
    // return await res.json();
    return db.getSettings();
  },

  async saveSettings(settingsData) {
    await simulateNetworkDelay();
    // FUTURE BACKEND INTEGRATION:
    // const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.settings}`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(settingsData)
    // });
    // return await res.json();
    return db.saveSettings(settingsData);
  }
};


/* ==============================================================================
   SECTION 2: INITIAL REALISTIC SAMPLE / DEMO DATA
   ==============================================================================
   Curated Indian blood bank sample records conforming to e-RaktKosh standards.
   Includes active batches, near-expiry warning batches, diverse donors,
   hospital requisition orders, and collection history.
   ============================================================================== */

// Helper to generate dynamic dates relative to today
const getRelativeDate = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

const INITIAL_SETTINGS = {
  lowStockThreshold: 5,        // Units below which blood group triggers Low Stock warning
  nearExpiryDaysThreshold: 7,  // Days before expiry to trigger alert
  facilityName: 'Central Regional Blood Centre (e-RaktKosh Partner)',
  licenseNumber: 'DL-BB-2024-0981',
  nodalOfficer: 'Dr. Amit Roy',
  contactPhone: '+91 11 2345 6789'
};

const INITIAL_INVENTORY = [
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

const INITIAL_DONORS = [
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

const INITIAL_REQUESTS = [
  { id: 'REQ-501', patientName: 'Suresh Kumar', hospitalName: 'AIIMS New Delhi', bloodGroup: 'A+', units: 2, contactPhone: '9811223344', requestDate: getRelativeDate(-1), status: 'Approved' },
  { id: 'REQ-502', patientName: 'Meera Patel', hospitalName: 'Apollo Hospital', bloodGroup: 'O-', units: 1, contactPhone: '9822334455', requestDate: getRelativeDate(-2), status: 'Pending' },
  { id: 'REQ-503', patientName: 'Deepak Verma', hospitalName: 'Max Super Speciality Hospital', bloodGroup: 'B+', units: 3, contactPhone: '9833445566', requestDate: getRelativeDate(-3), status: 'Fulfilled' },
  { id: 'REQ-504', patientName: 'Gurpreet Singh', hospitalName: 'Fortis Healthcare', bloodGroup: 'AB-', units: 1, contactPhone: '9844556677', requestDate: getRelativeDate(-4), status: 'Pending' },
  { id: 'REQ-505', patientName: 'Fatima Sheikh', hospitalName: 'Safdarjung Hospital', bloodGroup: 'A-', units: 2, contactPhone: '9855667788', requestDate: getRelativeDate(-5), status: 'Fulfilled' },
  { id: 'REQ-506', patientName: 'Ramesh Reddy', hospitalName: 'Sir Ganga Ram Hospital', bloodGroup: 'O+', units: 4, contactPhone: '9866778899', requestDate: getRelativeDate(-7), status: 'Rejected' }
];

const INITIAL_DONATIONS = [
  { id: 'DON-201', donorId: 'DNR-101', donorName: 'Rajesh Sharma', bloodGroup: 'A+', units: 1, donationDate: getRelativeDate(-15), status: 'Completed' },
  { id: 'DON-202', donorId: 'DNR-102', donorName: 'Priya Sundaram', bloodGroup: 'B+', units: 1, donationDate: getRelativeDate(-10), status: 'Completed' },
  { id: 'DON-203', donorId: 'DNR-103', donorName: 'Vikramaditya Roy', bloodGroup: 'O+', units: 1, donationDate: getRelativeDate(-8), status: 'Completed' },
  { id: 'DON-204', donorId: 'DNR-104', donorName: 'Ananya Deshmukh', bloodGroup: 'AB+', units: 1, donationDate: getRelativeDate(-12), status: 'Completed' },
  { id: 'DON-205', donorId: 'DNR-109', donorName: 'Rohan Gupta', bloodGroup: 'A+', units: 1, donationDate: getRelativeDate(-5), status: 'Completed' },
  { id: 'DON-206', donorId: 'DNR-108', donorName: 'Sunita Gill', bloodGroup: 'B-', units: 1, donationDate: getRelativeDate(-25), status: 'Under Testing' }
];


/* ==============================================================================
   SECTION 3: LOCALSTORAGE DATABASE SIMULATION (CLIENT STORAGE)
   ==============================================================================
   Maintains application state locally across browser reloads.
   ============================================================================== */

const DB_KEYS = {
  INVENTORY: 'bbims_inventory_v1',
  DONORS: 'bbims_donors_v1',
  REQUESTS: 'bbims_requests_v1',
  DONATIONS: 'bbims_donations_v1',
  SETTINGS: 'bbims_settings_v1'
};

const db = {
  // Inventory
  getInventory() {
    const raw = localStorage.getItem(DB_KEYS.INVENTORY);
    return raw ? JSON.parse(raw) : INITIAL_INVENTORY;
  },
  saveInventory(data) {
    localStorage.setItem(DB_KEYS.INVENTORY, JSON.stringify(data));
  },
  addInventoryBatch(batch) {
    const list = this.getInventory();
    list.unshift(batch);
    this.saveInventory(list);
    return batch;
  },
  updateInventoryBatch(id, updated) {
    let list = this.getInventory();
    list = list.map(item => item.id === id ? { ...item, ...updated } : item);
    this.saveInventory(list);
    return true;
  },
  deleteInventoryBatch(id) {
    let list = this.getInventory();
    list = list.filter(item => item.id !== id);
    this.saveInventory(list);
    return true;
  },

  // Donors
  getDonors() {
    const raw = localStorage.getItem(DB_KEYS.DONORS);
    return raw ? JSON.parse(raw) : INITIAL_DONORS;
  },
  saveDonors(data) {
    localStorage.setItem(DB_KEYS.DONORS, JSON.stringify(data));
  },
  addDonor(donor) {
    const list = this.getDonors();
    list.unshift(donor);
    this.saveDonors(list);
    return donor;
  },
  updateDonor(id, updated) {
    let list = this.getDonors();
    list = list.map(item => item.id === id ? { ...item, ...updated } : item);
    this.saveDonors(list);
    return true;
  },
  deleteDonor(id) {
    let list = this.getDonors();
    list = list.filter(item => item.id !== id);
    this.saveDonors(list);
    return true;
  },

  // Requests
  getRequests() {
    const raw = localStorage.getItem(DB_KEYS.REQUESTS);
    return raw ? JSON.parse(raw) : INITIAL_REQUESTS;
  },
  saveRequests(data) {
    localStorage.setItem(DB_KEYS.REQUESTS, JSON.stringify(data));
  },
  addRequest(req) {
    const list = this.getRequests();
    list.unshift(req);
    this.saveRequests(list);
    return req;
  },
  updateRequestStatus(id, newStatus) {
    let list = this.getRequests();
    list = list.map(item => item.id === id ? { ...item, status: newStatus } : item);
    this.saveRequests(list);
    return true;
  },
  deleteRequest(id) {
    let list = this.getRequests();
    list = list.filter(item => item.id !== id);
    this.saveRequests(list);
    return true;
  },

  // Donations
  getDonations() {
    const raw = localStorage.getItem(DB_KEYS.DONATIONS);
    return raw ? JSON.parse(raw) : INITIAL_DONATIONS;
  },
  saveDonations(data) {
    localStorage.setItem(DB_KEYS.DONATIONS, JSON.stringify(data));
  },
  addDonation(donation) {
    const list = this.getDonations();
    list.unshift(donation);
    this.saveDonations(list);
    return donation;
  },
  deleteDonation(id) {
    let list = this.getDonations();
    list = list.filter(item => item.id !== id);
    this.saveDonations(list);
    return true;
  },

  // Settings
  getSettings() {
    const raw = localStorage.getItem(DB_KEYS.SETTINGS);
    return raw ? JSON.parse(raw) : INITIAL_SETTINGS;
  },
  saveSettings(settings) {
    localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(settings));
    return settings;
  },

  // Reset Everything to Clean Initial State
  resetAll() {
    localStorage.setItem(DB_KEYS.INVENTORY, JSON.stringify(INITIAL_INVENTORY));
    localStorage.setItem(DB_KEYS.DONORS, JSON.stringify(INITIAL_DONORS));
    localStorage.setItem(DB_KEYS.REQUESTS, JSON.stringify(INITIAL_REQUESTS));
    localStorage.setItem(DB_KEYS.DONATIONS, JSON.stringify(INITIAL_DONATIONS));
    localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
  }
};

// Initialize default data if fresh session
(function initializeStorage() {
  if (!localStorage.getItem(DB_KEYS.INVENTORY)) localStorage.setItem(DB_KEYS.INVENTORY, JSON.stringify(INITIAL_INVENTORY));
  if (!localStorage.getItem(DB_KEYS.DONORS)) localStorage.setItem(DB_KEYS.DONORS, JSON.stringify(INITIAL_DONORS));
  if (!localStorage.getItem(DB_KEYS.REQUESTS)) localStorage.setItem(DB_KEYS.REQUESTS, JSON.stringify(INITIAL_REQUESTS));
  if (!localStorage.getItem(DB_KEYS.DONATIONS)) localStorage.setItem(DB_KEYS.DONATIONS, JSON.stringify(INITIAL_DONATIONS));
  if (!localStorage.getItem(DB_KEYS.SETTINGS)) localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
})();


/* ==============================================================================
   SECTION 4: NOTIFICATION & TOAST MESSAGING SYSTEM
   ============================================================================== */

/**
 * Display a modern toast notification at the top right
 * @param {string} message - Message text
 * @param {'success'|'warning'|'danger'|'info'} type - Toast type
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconMap = {
    success: 'fa-solid fa-circle-check',
    warning: 'fa-solid fa-triangle-exclamation',
    danger: 'fa-solid fa-circle-xmark',
    info: 'fa-solid fa-circle-info'
  };

  toast.innerHTML = `
    <i class="${iconMap[type] || iconMap.info} toast-icon"></i>
    <span class="toast-message">${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  // Auto-dismiss after 3.5 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(40px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/**
 * Update topbar notification bell and dropdown popover
 */
async function updateNotificationPopover() {
  const inventory = await apiService.getInventory();
  const settings = await apiService.getSettings();
  const notifList = document.getElementById('notifList');
  const notifBadge = document.getElementById('notifBadge');
  const notifCountLabel = document.getElementById('notifCountLabel');

  const alerts = [];

  // Check 1: Blood groups with low stock
  const allGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  allGroups.forEach(grp => {
    const units = inventory
      .filter(b => b.bloodGroup === grp && getDaysDifference(b.expiryDate) > 0)
      .reduce((sum, b) => sum + parseInt(b.units || 0), 0);

    if (units === 0) {
      alerts.push({
        type: 'danger',
        title: `Out of Stock: ${grp}`,
        message: `There are 0 available units in inventory for blood group ${grp}!`
      });
    } else if (units < settings.lowStockThreshold) {
      alerts.push({
        type: 'warn',
        title: `Low Stock: ${grp}`,
        message: `${grp} has only ${units} units (Threshold is ${settings.lowStockThreshold}).`
      });
    }
  });

  // Check 2: Batches near expiry (<= threshold days)
  inventory.forEach(batch => {
    const daysLeft = getDaysDifference(batch.expiryDate);
    if (daysLeft < 0) {
      alerts.push({
        type: 'danger',
        title: `Expired Batch: ${batch.id}`,
        message: `Batch ${batch.id} (${batch.bloodGroup}, ${batch.units} units) has expired!`
      });
    } else if (daysLeft <= settings.nearExpiryDaysThreshold) {
      alerts.push({
        type: 'warn',
        title: `Near Expiry: ${batch.id}`,
        message: `Batch ${batch.id} (${batch.bloodGroup}) will expire in ${daysLeft} day${daysLeft === 1 ? '' : 's'}.`
      });
    }
  });

  // Update Badge Count
  if (notifBadge) {
    notifBadge.textContent = alerts.length;
    notifBadge.style.display = alerts.length > 0 ? 'flex' : 'none';
  }
  if (notifCountLabel) {
    notifCountLabel.textContent = `${alerts.length} Alert${alerts.length === 1 ? '' : 's'}`;
    notifCountLabel.className = alerts.length > 0 ? 'badge badge-danger' : 'badge badge-success';
  }

  // Render Popover Items
  if (!notifList) return;
  if (alerts.length === 0) {
    notifList.innerHTML = `
      <div class="empty-state-sm">
        <i class="fa-regular fa-bell-slash"></i>
        <p>No critical stock or expiry alerts</p>
      </div>
    `;
  } else {
    notifList.innerHTML = alerts.map(a => `
      <div class="notif-item">
        <div class="notif-icon ${a.type}">
          <i class="${a.type === 'danger' ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-clock'}"></i>
        </div>
        <div class="notif-content">
          <h4>${escapeHtml(a.title)}</h4>
          <p>${escapeHtml(a.message)}</p>
        </div>
      </div>
    `).join('');
  }
}


/* ==============================================================================
   SECTION 5: NAVIGATION & VIEW SWITCHING
   ============================================================================== */

const viewMetadata = {
  dashboard: { title: 'Dashboard Overview', subtitle: 'Real-time blood stock and operations monitoring' },
  inventory: { title: 'Blood Inventory Management', subtitle: 'Detailed batch tracking, reservations, and shelf-life monitoring' },
  donors: { title: 'Donor Management', subtitle: 'Voluntary donor records, contact information, and eligibility verification' },
  requests: { title: 'Blood Request Management', subtitle: 'Process hospital requisitions and track emergency allocations' },
  donations: { title: 'Donation Records', subtitle: 'Historical blood collection logs from voluntary drives and walk-ins' },
  reports: { title: 'Reports & Analytics', subtitle: 'Consolidated executive inventory and fulfillment audit' },
  settings: { title: 'System Settings', subtitle: 'Configure inventory safety thresholds and facility credentials' }
};

/**
 * Navigate to a specific view
 * @param {string} viewId - View identifier (e.g., 'dashboard', 'inventory')
 */
function navigateTo(viewId) {
  // Hide all view sections
  const views = document.querySelectorAll('.content-view');
  views.forEach(v => v.classList.remove('active'));

  // Show target view section
  const targetView = document.getElementById(`view-${viewId}`);
  if (targetView) {
    targetView.classList.add('active');
  }

  // Update sidebar active link
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    if (link.getAttribute('data-view') === viewId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Update Topbar Title & Subtitle
  const meta = viewMetadata[viewId] || { title: 'BBIMS Portal', subtitle: 'Healthcare Administration' };
  const pageTitle = document.getElementById('pageTitle');
  const pageSubtitle = document.getElementById('pageSubtitle');
  if (pageTitle) pageTitle.textContent = meta.title;
  if (pageSubtitle) pageSubtitle.textContent = meta.subtitle;

  // Close mobile sidebar if open
  closeMobileSidebar();

  // Trigger view data refresh
  refreshActiveViewData(viewId);
}

/**
 * Refresh data corresponding to the active view
 */
async function refreshActiveViewData(viewId) {
  switch (viewId) {
    case 'dashboard':
      await renderDashboard();
      break;
    case 'inventory':
      await renderInventory();
      break;
    case 'donors':
      await renderDonors();
      break;
    case 'requests':
      await renderRequests();
      break;
    case 'donations':
      await renderDonations();
      break;
    case 'reports':
      await renderReports();
      break;
    case 'settings':
      await renderSettings();
      break;
  }
  await updateNotificationPopover();
}

// Mobile Sidebar Controls
function openMobileSidebar() {
  document.getElementById('sidebar')?.classList.add('mobile-open');
  document.getElementById('sidebarOverlay')?.classList.add('active');
}

function closeMobileSidebar() {
  document.getElementById('sidebar')?.classList.remove('mobile-open');
  document.getElementById('sidebarOverlay')?.classList.remove('active');
}


/* ==============================================================================
   SECTION 6: MODULE 1: DASHBOARD
   ============================================================================== */

async function renderDashboard() {
  const inventory = await apiService.getInventory();
  const donors = await apiService.getDonors();
  const requests = await apiService.getRequests();
  const donations = await apiService.getDonations();
  const settings = await apiService.getSettings();

  // 1. Calculate Metric Totals
  const totalUnits = inventory
    .filter(b => getDaysDifference(b.expiryDate) > 0)
    .reduce((sum, b) => sum + parseInt(b.units || 0), 0);
  
  const totalDonors = donors.length;
  const totalRequests = requests.length;
  const pendingRequests = requests.filter(r => r.status === 'Pending').length;

  // Update DOM Metric Cards
  document.getElementById('dashTotalUnits').textContent = totalUnits;
  document.getElementById('dashTotalDonors').textContent = totalDonors;
  document.getElementById('dashTotalRequests').textContent = totalRequests;
  document.getElementById('dashPendingRequests').textContent = pendingRequests;
  document.getElementById('dashThresholdDisplay').textContent = settings.lowStockThreshold;

  // Update Sidebar pending requests badge
  const navBadge = document.getElementById('navPendingBadge');
  if (navBadge) {
    navBadge.textContent = pendingRequests;
    navBadge.style.display = pendingRequests > 0 ? 'inline-block' : 'none';
  }

  // 2. Render Dynamic Alert Banners on Dashboard
  const alertsContainer = document.getElementById('dashboardAlertsContainer');
  const alertBanners = [];

  // Critical Low Stock check
  const allGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const lowGroups = [];
  allGroups.forEach(grp => {
    const grpUnits = inventory
      .filter(b => b.bloodGroup === grp && getDaysDifference(b.expiryDate) > 0)
      .reduce((sum, b) => sum + parseInt(b.units || 0), 0);
    if (grpUnits < settings.lowStockThreshold) {
      lowGroups.push(`${grp} (${grpUnits} units)`);
    }
  });

  if (lowGroups.length > 0) {
    alertBanners.push(`
      <div class="alert-box alert-warning">
        <div class="alert-content">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <span><strong>Low Stock Warning:</strong> Blood groups ${lowGroups.join(', ')} are below safety threshold (${settings.lowStockThreshold} units). Consider scheduling a donation drive.</span>
        </div>
        <button class="btn btn-sm btn-outline" onclick="navigateTo('donors')">Find Donors</button>
      </div>
    `);
  }

  // Near Expiry check
  const nearExpiryBatches = inventory.filter(b => {
    const days = getDaysDifference(b.expiryDate);
    return days >= 0 && days <= settings.nearExpiryDaysThreshold;
  });

  if (nearExpiryBatches.length > 0) {
    alertBanners.push(`
      <div class="alert-box alert-danger">
        <div class="alert-content">
          <i class="fa-solid fa-clock"></i>
          <span><strong>Near Expiry Alert:</strong> ${nearExpiryBatches.length} blood batch(es) will expire within ${settings.nearExpiryDaysThreshold} days. Prioritize these for pending requisitions.</span>
        </div>
        <button class="btn btn-sm btn-outline" onclick="navigateTo('inventory')">Review Batches</button>
      </div>
    `);
  }

  alertsContainer.innerHTML = alertBanners.join('');

  // 3. Render 8 Blood Group Availability Cards
  const bloodGrid = document.getElementById('dashBloodGrid');
  bloodGrid.innerHTML = allGroups.map(grp => {
    const availableUnits = inventory
      .filter(b => b.bloodGroup === grp && getDaysDifference(b.expiryDate) > 0)
      .reduce((sum, b) => sum + parseInt(b.units || 0), 0);

    let statusClass = 'normal';
    let statusLabel = 'Available';

    if (availableUnits === 0) {
      statusClass = 'critical';
      statusLabel = 'Out of Stock';
    } else if (availableUnits < settings.lowStockThreshold) {
      statusClass = 'low';
      statusLabel = 'Low Stock';
    }

    return `
      <div class="blood-card ${statusClass === 'critical' ? 'critical-stock' : (statusClass === 'low' ? 'low-stock' : '')}" onclick="filterInventoryByGroup('${grp}')">
        <span class="blood-group-tag">${grp}</span>
        <div class="blood-unit-count">${availableUnits}</div>
        <span class="blood-unit-label">Units Available</span>
        <span class="stock-indicator-pill ${statusClass}">${statusLabel}</span>
      </div>
    `;
  }).join('');

  // 4. Render Recent Donations Table (Latest 4)
  const recentDonationsTbody = document.getElementById('dashRecentDonationsTable');
  const latestDonations = donations.slice(0, 4);
  if (latestDonations.length === 0) {
    recentDonationsTbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-3">No recent donations logged</td></tr>`;
  } else {
    recentDonationsTbody.innerHTML = latestDonations.map(don => `
      <tr>
        <td><strong>${escapeHtml(don.donorName)}</strong></td>
        <td><span class="blood-pill">${escapeHtml(don.bloodGroup)}</span></td>
        <td>${escapeHtml(don.units)} Bag(s)</td>
        <td>${formatDate(don.donationDate)}</td>
        <td><span class="badge ${don.status === 'Completed' ? 'badge-success' : 'badge-info'}">${escapeHtml(don.status)}</span></td>
      </tr>
    `).join('');
  }

  // 5. Render Recent Requests Table (Latest 4)
  const recentRequestsTbody = document.getElementById('dashRecentRequestsTable');
  const latestRequests = requests.slice(0, 4);
  if (latestRequests.length === 0) {
    recentRequestsTbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-3">No blood requests submitted</td></tr>`;
  } else {
    recentRequestsTbody.innerHTML = latestRequests.map(req => {
      const badgeClass = getRequestStatusBadgeClass(req.status);
      return `
        <tr>
          <td>
            <strong>${escapeHtml(req.patientName)}</strong>
            <small class="text-muted d-block">${escapeHtml(req.hospitalName)}</small>
          </td>
          <td><span class="blood-pill">${escapeHtml(req.bloodGroup)}</span></td>
          <td>${escapeHtml(req.units)} Unit(s)</td>
          <td>${formatDate(req.requestDate)}</td>
          <td><span class="badge ${badgeClass}">${escapeHtml(req.status)}</span></td>
        </tr>
      `;
    }).join('');
  }
}

/**
 * Quick jump to inventory filtered by selected blood group
 */
function filterInventoryByGroup(grp) {
  navigateTo('inventory');
  setTimeout(() => {
    const grpFilter = document.getElementById('inventoryGroupFilter');
    if (grpFilter) {
      grpFilter.value = grp;
      renderInventory();
    }
  }, 50);
}


/* ==============================================================================
   SECTION 7: MODULE 2: BLOOD INVENTORY MANAGEMENT
   ============================================================================== */

async function renderInventory() {
  const inventory = await apiService.getInventory();
  const settings = await apiService.getSettings();

  const searchVal = (document.getElementById('inventorySearchInput')?.value || '').toLowerCase().trim();
  const groupVal = document.getElementById('inventoryGroupFilter')?.value || '';
  const statusVal = document.getElementById('inventoryStatusFilter')?.value || '';

  // Render Group Filter Chips
  const chipsContainer = document.getElementById('inventoryGroupChips');
  if (chipsContainer) {
    const allGroups = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    chipsContainer.innerHTML = allGroups.map(grp => {
      const isSelected = (grp === 'All' && !groupVal) || (grp === groupVal);
      return `
        <button class="chip-btn ${isSelected ? 'active' : ''}" onclick="handleInventoryChipClick('${grp === 'All' ? '' : grp}')">
          ${grp}
        </button>
      `;
    }).join('');
  }

  // Filter Records
  const filtered = inventory.filter(item => {
    // Search filter
    const matchesSearch = !searchVal || 
      item.id.toLowerCase().includes(searchVal) ||
      (item.donorId && item.donorId.toLowerCase().includes(searchVal)) ||
      (item.notes && item.notes.toLowerCase().includes(searchVal)) ||
      item.bloodGroup.toLowerCase().includes(searchVal);

    // Group filter
    const matchesGroup = !groupVal || item.bloodGroup === groupVal;

    // Status filter
    const daysLeft = getDaysDifference(item.expiryDate);
    let batchStatus = 'Available';
    if (daysLeft < 0) batchStatus = 'Expired';
    else if (daysLeft <= settings.nearExpiryDaysThreshold) batchStatus = 'Near Expiry';

    const matchesStatus = !statusVal || batchStatus === statusVal;

    return matchesSearch && matchesGroup && matchesStatus;
  });

  // Update Record Count
  const countEl = document.getElementById('inventoryCount');
  if (countEl) countEl.textContent = filtered.length;

  // Render Table
  const tbody = document.getElementById('inventoryTableBody');
  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted py-4">No blood batches match the selected criteria.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(b => {
    const daysLeft = getDaysDifference(b.expiryDate);
    let statusBadge = '<span class="badge badge-success">Available</span>';
    let daysBadge = `<span class="text-success font-weight-bold">${daysLeft} days</span>`;

    if (daysLeft < 0) {
      statusBadge = '<span class="badge badge-danger">Expired</span>';
      daysBadge = `<span class="badge badge-danger">Expired ${Math.abs(daysLeft)}d ago</span>`;
    } else if (daysLeft <= settings.nearExpiryDaysThreshold) {
      statusBadge = '<span class="badge badge-warning">Near Expiry</span>';
      daysBadge = `<span class="badge badge-warning">${daysLeft} day${daysLeft === 1 ? '' : 's'} left</span>`;
    }

    return `
      <tr>
        <td><strong>${escapeHtml(b.id)}</strong></td>
        <td><span class="blood-pill">${escapeHtml(b.bloodGroup)}</span></td>
        <td><strong>${escapeHtml(b.units)}</strong> Bags</td>
        <td>${formatDate(b.collectionDate)}</td>
        <td>${formatDate(b.expiryDate)}</td>
        <td>${daysBadge}</td>
        <td>${b.donorId ? `<span class="text-muted">${escapeHtml(b.donorId)}</span>` : '<span class="text-light">&mdash;</span>'}</td>
        <td>${statusBadge}</td>
        <td class="text-right">
          <button class="btn-action-icon" onclick="viewBatchDetails('${b.id}')" title="View Batch Details">
            <i class="fa-solid fa-eye"></i>
          </button>
          <button class="btn-action-icon" onclick="openEditStockModal('${b.id}')" title="Edit Batch">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="btn-action-icon text-danger" onclick="confirmDeleteStock('${b.id}')" title="Delete Batch">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function handleInventoryChipClick(grp) {
  const select = document.getElementById('inventoryGroupFilter');
  if (select) select.value = grp;
  renderInventory();
}

function resetInventoryFilters() {
  document.getElementById('inventorySearchInput').value = '';
  document.getElementById('inventoryGroupFilter').value = '';
  document.getElementById('inventoryStatusFilter').value = '';
  renderInventory();
}

async function viewBatchDetails(id) {
  const inventory = await apiService.getInventory();
  const batch = inventory.find(b => b.id === id);
  if (!batch) return;

  const daysLeft = getDaysDifference(batch.expiryDate);
  const status = daysLeft < 0 ? 'Expired' : (daysLeft <= 7 ? 'Near Expiry' : 'Available');

  const content = `
    <div class="details-list">
      <div class="detail-row"><span class="detail-label">Batch ID:</span><span class="detail-value">${batch.id}</span></div>
      <div class="detail-row"><span class="detail-label">Blood Group:</span><span class="detail-value"><span class="blood-pill">${batch.bloodGroup}</span></span></div>
      <div class="detail-row"><span class="detail-label">Total Units:</span><span class="detail-value">${batch.units} Units</span></div>
      <div class="detail-row"><span class="detail-label">Collection Date:</span><span class="detail-value">${formatDate(batch.collectionDate)}</span></div>
      <div class="detail-row"><span class="detail-label">Expiry Date:</span><span class="detail-value">${formatDate(batch.expiryDate)}</span></div>
      <div class="detail-row"><span class="detail-label">Days to Expiry:</span><span class="detail-value">${daysLeft} days</span></div>
      <div class="detail-row"><span class="detail-label">Donor Reference:</span><span class="detail-value">${batch.donorId || 'Unlinked / Walk-in'}</span></div>
      <div class="detail-row"><span class="detail-label">Status:</span><span class="detail-value">${status}</span></div>
      <div class="detail-row"><span class="detail-label">Location / Notes:</span><span class="detail-value">${escapeHtml(batch.notes || 'None')}</span></div>
    </div>
  `;

  openDetailsModal('Blood Batch Details', content);
}


/* ==============================================================================
   SECTION 8: MODULE 3: DONOR MANAGEMENT & ELIGIBILITY
   ============================================================================== */

/**
 * Check donor eligibility: Standard guidelines require 90 days between donations.
 * @param {string} lastDonationDate - ISO Date string
 * @returns {{isEligible: boolean, message: string}}
 */
function checkDonorEligibility(lastDonationDate) {
  if (!lastDonationDate) {
    return { isEligible: true, message: 'Eligible (First time donor)' };
  }
  const daysSince = Math.abs(getDaysDifference(lastDonationDate));
  if (daysSince >= 90) {
    return { isEligible: true, message: 'Eligible Now' };
  } else {
    const daysRemaining = 90 - daysSince;
    return { isEligible: false, message: `Eligible in ${daysRemaining} days` };
  }
}

async function renderDonors() {
  const donors = await apiService.getDonors();

  const searchVal = (document.getElementById('donorSearchInput')?.value || '').toLowerCase().trim();
  const groupVal = document.getElementById('donorGroupFilter')?.value || '';
  const genderVal = document.getElementById('donorGenderFilter')?.value || '';

  // Filter
  const filtered = donors.filter(d => {
    const matchesSearch = !searchVal ||
      d.id.toLowerCase().includes(searchVal) ||
      d.fullName.toLowerCase().includes(searchVal) ||
      d.city.toLowerCase().includes(searchVal) ||
      d.contactPhone.toLowerCase().includes(searchVal);

    const matchesGroup = !groupVal || d.bloodGroup === groupVal;
    const matchesGender = !genderVal || d.gender === genderVal;

    return matchesSearch && matchesGroup && matchesGender;
  });

  const countEl = document.getElementById('donorCount');
  if (countEl) countEl.textContent = filtered.length;

  const tbody = document.getElementById('donorTableBody');
  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted py-4">No donors match your search or filter.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(d => {
    const eligibility = checkDonorEligibility(d.lastDonationDate);
    const eligibilityBadge = eligibility.isEligible
      ? `<span class="badge badge-success"><i class="fa-solid fa-check"></i> ${eligibility.message}</span>`
      : `<span class="badge badge-warning"><i class="fa-solid fa-hourglass-half"></i> ${eligibility.message}</span>`;

    return `
      <tr>
        <td><strong>${escapeHtml(d.id)}</strong></td>
        <td><strong>${escapeHtml(d.fullName)}</strong></td>
        <td>${escapeHtml(d.age)} yrs / ${escapeHtml(d.gender)}</td>
        <td><span class="blood-pill">${escapeHtml(d.bloodGroup)}</span></td>
        <td><i class="fa-solid fa-phone text-muted"></i> ${escapeHtml(d.contactPhone)}</td>
        <td>${escapeHtml(d.city)}</td>
        <td>${d.lastDonationDate ? formatDate(d.lastDonationDate) : '<span class="text-muted">Never Donated</span>'}</td>
        <td>${eligibilityBadge}</td>
        <td class="text-right">
          <button class="btn-action-icon" onclick="viewDonorDetails('${d.id}')" title="View Donor">
            <i class="fa-solid fa-eye"></i>
          </button>
          <button class="btn-action-icon" onclick="openEditDonorModal('${d.id}')" title="Edit Donor">
            <i class="fa-solid fa-user-pen"></i>
          </button>
          <button class="btn-action-icon text-danger" onclick="confirmDeleteDonor('${d.id}')" title="Delete Donor">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function resetDonorFilters() {
  document.getElementById('donorSearchInput').value = '';
  document.getElementById('donorGroupFilter').value = '';
  document.getElementById('donorGenderFilter').value = '';
  renderDonors();
}

async function viewDonorDetails(id) {
  const donors = await apiService.getDonors();
  const donor = donors.find(d => d.id === id);
  if (!donor) return;

  const eligibility = checkDonorEligibility(donor.lastDonationDate);

  const content = `
    <div class="details-list">
      <div class="detail-row"><span class="detail-label">Donor ID:</span><span class="detail-value">${donor.id}</span></div>
      <div class="detail-row"><span class="detail-label">Full Name:</span><span class="detail-value">${escapeHtml(donor.fullName)}</span></div>
      <div class="detail-row"><span class="detail-label">Age & Gender:</span><span class="detail-value">${donor.age} Years (${donor.gender})</span></div>
      <div class="detail-row"><span class="detail-label">Blood Group:</span><span class="detail-value"><span class="blood-pill">${donor.bloodGroup}</span></span></div>
      <div class="detail-row"><span class="detail-label">Contact Number:</span><span class="detail-value">${escapeHtml(donor.contactPhone)}</span></div>
      <div class="detail-row"><span class="detail-label">City:</span><span class="detail-value">${escapeHtml(donor.city)}</span></div>
      <div class="detail-row"><span class="detail-label">Last Donation:</span><span class="detail-value">${donor.lastDonationDate ? formatDate(donor.lastDonationDate) : 'First-time Donor'}</span></div>
      <div class="detail-row"><span class="detail-label">Eligibility Status:</span><span class="detail-value">${eligibility.message}</span></div>
    </div>
  `;

  openDetailsModal('Donor Profile Details', content);
}


/* ==============================================================================
   SECTION 9: MODULE 4: BLOOD REQUEST MANAGEMENT
   ============================================================================== */

function getRequestStatusBadgeClass(status) {
  switch (status) {
    case 'Approved': return 'badge-info';
    case 'Fulfilled': return 'badge-success';
    case 'Rejected': return 'badge-danger';
    case 'Pending':
    default:
      return 'badge-warning';
  }
}

async function renderRequests() {
  const requests = await apiService.getRequests();

  const searchVal = (document.getElementById('requestSearchInput')?.value || '').toLowerCase().trim();
  const statusVal = document.getElementById('requestStatusFilter')?.value || '';
  const groupVal = document.getElementById('requestGroupFilter')?.value || '';

  const filtered = requests.filter(r => {
    const matchesSearch = !searchVal ||
      r.id.toLowerCase().includes(searchVal) ||
      r.patientName.toLowerCase().includes(searchVal) ||
      r.hospitalName.toLowerCase().includes(searchVal);

    const matchesStatus = !statusVal || r.status === statusVal;
    const matchesGroup = !groupVal || r.bloodGroup === groupVal;

    return matchesSearch && matchesStatus && matchesGroup;
  });

  const countEl = document.getElementById('requestCount');
  if (countEl) countEl.textContent = filtered.length;

  const tbody = document.getElementById('requestTableBody');
  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted py-4">No blood requests match the current filters.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(req => {
    const badgeClass = getRequestStatusBadgeClass(req.status);

    return `
      <tr>
        <td><strong>${escapeHtml(req.id)}</strong></td>
        <td><strong>${escapeHtml(req.patientName)}</strong></td>
        <td>${escapeHtml(req.hospitalName)}</td>
        <td><span class="blood-pill">${escapeHtml(req.bloodGroup)}</span></td>
        <td><strong>${escapeHtml(req.units)}</strong> Units</td>
        <td><i class="fa-solid fa-phone text-muted"></i> ${escapeHtml(req.contactPhone)}</td>
        <td>${formatDate(req.requestDate)}</td>
        <td><span class="badge ${badgeClass}">${escapeHtml(req.status)}</span></td>
        <td class="text-right">
          <!-- Status Action Dropdown Simulator -->
          <select class="btn btn-sm btn-outline" onchange="handleRequestStatusChange('${req.id}', this.value)" style="padding: 4px 8px; font-size: 11.5px; border-radius: 4px;">
            <option value="">Update Status...</option>
            <option value="Approved" ${req.status === 'Approved' ? 'disabled' : ''}>Approve</option>
            <option value="Fulfilled" ${req.status === 'Fulfilled' ? 'disabled' : ''}>Fulfill</option>
            <option value="Rejected" ${req.status === 'Rejected' ? 'disabled' : ''}>Reject</option>
            <option value="Pending" ${req.status === 'Pending' ? 'disabled' : ''}>Reset to Pending</option>
          </select>
          <button class="btn-action-icon text-danger" onclick="confirmDeleteRequest('${req.id}')" title="Delete Request">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function resetRequestFilters() {
  document.getElementById('requestSearchInput').value = '';
  document.getElementById('requestStatusFilter').value = '';
  document.getElementById('requestGroupFilter').value = '';
  renderRequests();
}

async function handleRequestStatusChange(requestId, newStatus) {
  if (!newStatus) return;
  await apiService.updateRequestStatus(requestId, newStatus);
  showToast(`Request ${requestId} status updated to ${newStatus}`, 'success');
  await renderRequests();
  await updateNotificationPopover();
}


/* ==============================================================================
   SECTION 10: MODULE 5: DONATION RECORDS
   ============================================================================== */

async function renderDonations() {
  const donations = await apiService.getDonations();

  const searchVal = (document.getElementById('donationSearchInput')?.value || '').toLowerCase().trim();
  const groupVal = document.getElementById('donationGroupFilter')?.value || '';
  const statusVal = document.getElementById('donationStatusFilter')?.value || '';

  const filtered = donations.filter(d => {
    const matchesSearch = !searchVal ||
      d.id.toLowerCase().includes(searchVal) ||
      d.donorName.toLowerCase().includes(searchVal) ||
      d.donorId.toLowerCase().includes(searchVal);

    const matchesGroup = !groupVal || d.bloodGroup === groupVal;
    const matchesStatus = !statusVal || d.status === statusVal;

    return matchesSearch && matchesGroup && matchesStatus;
  });

  const countEl = document.getElementById('donationCount');
  if (countEl) countEl.textContent = filtered.length;

  const tbody = document.getElementById('donationTableBody');
  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">No donation logs found.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(d => {
    const badgeClass = d.status === 'Completed' ? 'badge-success' : (d.status === 'Under Testing' ? 'badge-info' : 'badge-warning');
    return `
      <tr>
        <td><strong>${escapeHtml(d.id)}</strong></td>
        <td>${escapeHtml(d.donorId)}</td>
        <td><strong>${escapeHtml(d.donorName)}</strong></td>
        <td><span class="blood-pill">${escapeHtml(d.bloodGroup)}</span></td>
        <td>${escapeHtml(d.units)} Bag(s)</td>
        <td>${formatDate(d.donationDate)}</td>
        <td><span class="badge ${badgeClass}">${escapeHtml(d.status)}</span></td>
        <td class="text-right">
          <button class="btn-action-icon text-danger" onclick="confirmDeleteDonation('${d.id}')" title="Delete Donation Log">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function resetDonationFilters() {
  document.getElementById('donationSearchInput').value = '';
  document.getElementById('donationGroupFilter').value = '';
  document.getElementById('donationStatusFilter').value = '';
  renderDonations();
}


/* ==============================================================================
   SECTION 11: MODULE 6: REPORTS & AUDIT SUMMARY
   ============================================================================== */

async function renderReports() {
  const inventory = await apiService.getInventory();
  const donors = await apiService.getDonors();
  const requests = await apiService.getRequests();
  const donations = await apiService.getDonations();
  const settings = await apiService.getSettings();

  // Facility Info
  document.getElementById('reportFacilityName').textContent = settings.facilityName;
  document.getElementById('reportLicenseNo').textContent = settings.licenseNumber;
  document.getElementById('reportTimestamp').textContent = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  // Calculate Metrics
  const totalStock = inventory
    .filter(b => getDaysDifference(b.expiryDate) > 0)
    .reduce((sum, b) => sum + parseInt(b.units || 0), 0);

  const totalDonors = donors.length;
  const totalDonations = donations.length;
  const totalRequests = requests.length;
  const fulfilledRequests = requests.filter(r => r.status === 'Fulfilled').length;
  const pendingRequests = requests.filter(r => r.status === 'Pending').length;
  const approvedRequests = requests.filter(r => r.status === 'Approved').length;
  const rejectedRequests = requests.filter(r => r.status === 'Rejected').length;

  const fulfillmentRate = totalRequests > 0 
    ? Math.round((fulfilledRequests / totalRequests) * 100) 
    : 0;

  // Render Metric Boxes
  document.getElementById('repTotalStock').textContent = `${totalStock} Units`;
  document.getElementById('repTotalDonors').textContent = totalDonors;
  document.getElementById('repTotalDonations').textContent = totalDonations;
  document.getElementById('repTotalRequests').textContent = totalRequests;
  document.getElementById('repFulfilledRequests').textContent = fulfilledRequests;
  document.getElementById('repFulfillmentRate').textContent = `${fulfillmentRate}%`;

  // Render Request Breakdown Grid
  document.getElementById('repPendingCount').textContent = pendingRequests;
  document.getElementById('repApprovedCount').textContent = approvedRequests;
  document.getElementById('repFulfilledCount').textContent = fulfilledRequests;
  document.getElementById('repRejectedCount').textContent = rejectedRequests;

  // Group-Wise Inventory Breakdown Table
  const allGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const tbody = document.getElementById('reportInventoryTableBody');
  if (!tbody) return;

  tbody.innerHTML = allGroups.map(grp => {
    const batches = inventory.filter(b => b.bloodGroup === grp);
    
    // Available (not expired)
    const available = batches
      .filter(b => getDaysDifference(b.expiryDate) > 0)
      .reduce((sum, b) => sum + parseInt(b.units || 0), 0);

    // Near expiry (<= threshold)
    const nearExpiry = batches
      .filter(b => {
        const days = getDaysDifference(b.expiryDate);
        return days >= 0 && days <= settings.nearExpiryDaysThreshold;
      })
      .reduce((sum, b) => sum + parseInt(b.units || 0), 0);

    // Expired
    const expired = batches
      .filter(b => getDaysDifference(b.expiryDate) < 0)
      .reduce((sum, b) => sum + parseInt(b.units || 0), 0);

    let stockStatus = '<span class="badge badge-success">Adequate</span>';
    if (available === 0) {
      stockStatus = '<span class="badge badge-danger">Out of Stock</span>';
    } else if (available < settings.lowStockThreshold) {
      stockStatus = '<span class="badge badge-warning">Low Stock</span>';
    }

    return `
      <tr>
        <td><span class="blood-pill">${grp}</span></td>
        <td><strong>${available} Units</strong></td>
        <td>${nearExpiry > 0 ? `<span class="text-danger font-weight-bold">${nearExpiry} Units</span>` : '0'}</td>
        <td>${expired > 0 ? `<span class="badge badge-danger">${expired} Units</span>` : '0'}</td>
        <td>${stockStatus}</td>
      </tr>
    `;
  }).join('');
}

function printReportDocument() {
  window.print();
}


/* ==============================================================================
   SECTION 12: MODULE 7: SETTINGS & FACILITY PREFERENCES
   ============================================================================== */

async function renderSettings() {
  const settings = await apiService.getSettings();

  document.getElementById('settingLowStockThreshold').value = settings.lowStockThreshold;
  document.getElementById('settingExpiryDaysThreshold').value = settings.nearExpiryDaysThreshold;
  document.getElementById('settingFacilityName').value = settings.facilityName;
  document.getElementById('settingLicenseNumber').value = settings.licenseNumber;
  document.getElementById('settingNodalOfficer').value = settings.nodalOfficer;
  document.getElementById('settingContactPhone').value = settings.contactPhone;
}

async function handleSaveThresholds(e) {
  e.preventDefault();
  const current = await apiService.getSettings();
  const lowStock = parseInt(document.getElementById('settingLowStockThreshold').value, 10);
  const nearExpiry = parseInt(document.getElementById('settingExpiryDaysThreshold').value, 10);

  const updated = {
    ...current,
    lowStockThreshold: lowStock,
    nearExpiryDaysThreshold: nearExpiry
  };

  await apiService.saveSettings(updated);
  showToast('Inventory alert thresholds updated successfully!', 'success');
  await updateNotificationPopover();
}

async function handleSaveFacility(e) {
  e.preventDefault();
  const current = await apiService.getSettings();

  const updated = {
    ...current,
    facilityName: document.getElementById('settingFacilityName').value.trim(),
    licenseNumber: document.getElementById('settingLicenseNumber').value.trim(),
    nodalOfficer: document.getElementById('settingNodalOfficer').value.trim(),
    contactPhone: document.getElementById('settingContactPhone').value.trim()
  };

  await apiService.saveSettings(updated);
  showToast('Blood Bank facility profile updated!', 'success');
}

function confirmResetDemoData() {
  openConfirmModal(
    'Reset Demo Data',
    'Are you sure you want to restore the default sample blood bank data? Any custom records added during this session will be reset.',
    () => {
      db.resetAll();
      showToast('All sample demo records have been restored!', 'success');
      navigateTo('dashboard');
      closeModal('modalConfirm');
    }
  );
}

function confirmClearLocalStorage() {
  openConfirmModal(
    'Clear Browser Storage',
    'This will wipe all cached BBIMS data from your browser. Continue?',
    () => {
      localStorage.clear();
      db.resetAll();
      showToast('Browser storage cleared and reset.', 'info');
      navigateTo('dashboard');
      closeModal('modalConfirm');
    }
  );
}


/* ==============================================================================
   SECTION 13: MODALS, FORMS, AND POPUP INTERACTIONS
   ============================================================================== */

function openModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.add('active');
}

function closeModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.remove('active');
}

function openDetailsModal(title, contentHtml) {
  document.getElementById('detailsModalTitle').textContent = title;
  document.getElementById('detailsModalBody').innerHTML = contentHtml;
  openModal('modalDetails');
}

function openConfirmModal(title, message, onConfirmCallback) {
  document.getElementById('confirmModalTitle').textContent = title;
  document.getElementById('confirmModalMessage').textContent = message;
  
  const confirmBtn = document.getElementById('confirmActionBtn');
  // Re-bind click event
  const newBtn = confirmBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
  newBtn.addEventListener('click', onConfirmCallback);

  openModal('modalConfirm');
}

// --- BLOOD STOCK MODAL HANDLERS ---

function openAddStockModal() {
  document.getElementById('stockModalTitle').textContent = 'Add Blood Stock Batch';
  document.getElementById('stockSubmitBtn').textContent = 'Save Batch';
  document.getElementById('stockBatchIdHidden').value = '';
  document.getElementById('stockBatchForm').reset();

  // Set default collection date to today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('stockCollectionDate').value = today;
  autoCalculateExpiryDate();

  openModal('modalStockBatch');
}

async function openEditStockModal(id) {
  const inventory = await apiService.getInventory();
  const batch = inventory.find(b => b.id === id);
  if (!batch) return;

  document.getElementById('stockModalTitle').textContent = `Edit Blood Batch (${batch.id})`;
  document.getElementById('stockSubmitBtn').textContent = 'Update Batch';
  document.getElementById('stockBatchIdHidden').value = batch.id;

  document.getElementById('stockBloodGroup').value = batch.bloodGroup;
  document.getElementById('stockUnits').value = batch.units;
  document.getElementById('stockCollectionDate').value = batch.collectionDate;
  document.getElementById('stockExpiryDate').value = batch.expiryDate;
  document.getElementById('stockDonorId').value = batch.donorId || '';
  document.getElementById('stockNotes').value = batch.notes || '';

  openModal('modalStockBatch');
}

function autoCalculateExpiryDate() {
  const colDateVal = document.getElementById('stockCollectionDate').value;
  if (!colDateVal) return;

  // Whole blood standard storage is ~35 days
  const colDate = new Date(colDateVal);
  colDate.setDate(colDate.getDate() + 35);
  document.getElementById('stockExpiryDate').value = colDate.toISOString().split('T')[0];
}

async function handleStockFormSubmit(e) {
  e.preventDefault();

  const hiddenId = document.getElementById('stockBatchIdHidden').value;
  const bloodGroup = document.getElementById('stockBloodGroup').value;
  const units = parseInt(document.getElementById('stockUnits').value, 10);
  const collectionDate = document.getElementById('stockCollectionDate').value;
  const expiryDate = document.getElementById('stockExpiryDate').value;
  const donorId = document.getElementById('stockDonorId').value.trim();
  const notes = document.getElementById('stockNotes').value.trim();

  if (units <= 0) {
    showToast('Units must be greater than zero', 'danger');
    return;
  }

  if (hiddenId) {
    // Update existing
    await apiService.updateInventoryBatch(hiddenId, {
      bloodGroup,
      units,
      collectionDate,
      expiryDate,
      donorId,
      notes
    });
    showToast(`Batch ${hiddenId} updated successfully`, 'success');
  } else {
    // Add new batch
    const newId = `BAT-${Math.floor(1000 + Math.random() * 9000)}`;
    await apiService.addInventoryBatch({
      id: newId,
      bloodGroup,
      units,
      collectionDate,
      expiryDate,
      donorId,
      notes
    });
    showToast(`New stock batch ${newId} (${bloodGroup}, ${units} units) added!`, 'success');
  }

  closeModal('modalStockBatch');
  await renderInventory();
  await updateNotificationPopover();
}

function confirmDeleteStock(id) {
  openConfirmModal(
    'Delete Blood Batch',
    `Are you sure you want to permanently remove blood batch ${id} from inventory?`,
    async () => {
      await apiService.deleteInventoryBatch(id);
      showToast(`Batch ${id} deleted from inventory`, 'info');
      closeModal('modalConfirm');
      await renderInventory();
      await updateNotificationPopover();
    }
  );
}

// --- DONOR MODAL HANDLERS ---

function openAddDonorModal() {
  document.getElementById('donorModalTitle').textContent = 'Register New Donor';
  document.getElementById('donorSubmitBtn').textContent = 'Save Donor';
  document.getElementById('donorIdHidden').value = '';
  document.getElementById('donorForm').reset();
  openModal('modalDonor');
}

async function openEditDonorModal(id) {
  const donors = await apiService.getDonors();
  const donor = donors.find(d => d.id === id);
  if (!donor) return;

  document.getElementById('donorModalTitle').textContent = `Edit Donor (${donor.id})`;
  document.getElementById('donorSubmitBtn').textContent = 'Update Donor';
  document.getElementById('donorIdHidden').value = donor.id;

  document.getElementById('donorFullName').value = donor.fullName;
  document.getElementById('donorAge').value = donor.age;
  document.getElementById('donorGender').value = donor.gender;
  document.getElementById('donorBloodGroup').value = donor.bloodGroup;
  document.getElementById('donorContactPhone').value = donor.contactPhone;
  document.getElementById('donorCity').value = donor.city;
  document.getElementById('donorLastDonationDate').value = donor.lastDonationDate || '';

  openModal('modalDonor');
}

async function handleDonorFormSubmit(e) {
  e.preventDefault();

  const hiddenId = document.getElementById('donorIdHidden').value;
  const fullName = document.getElementById('donorFullName').value.trim();
  const age = parseInt(document.getElementById('donorAge').value, 10);
  const gender = document.getElementById('donorGender').value;
  const bloodGroup = document.getElementById('donorBloodGroup').value;
  const contactPhone = document.getElementById('donorContactPhone').value.trim();
  const city = document.getElementById('donorCity').value.trim();
  const lastDonationDate = document.getElementById('donorLastDonationDate').value;

  // Form Validation
  if (age < 18 || age > 65) {
    showToast('Donor age must be between 18 and 65 years', 'danger');
    return;
  }
  if (!/^[0-9]{10}$/.test(contactPhone)) {
    showToast('Please enter a valid 10-digit mobile number', 'danger');
    return;
  }

  if (hiddenId) {
    await apiService.updateDonor(hiddenId, {
      fullName,
      age,
      gender,
      bloodGroup,
      contactPhone,
      city,
      lastDonationDate
    });
    showToast(`Donor ${hiddenId} updated successfully`, 'success');
  } else {
    const newId = `DNR-${Math.floor(100 + Math.random() * 900)}`;
    await apiService.addDonor({
      id: newId,
      fullName,
      age,
      gender,
      bloodGroup,
      contactPhone,
      city,
      lastDonationDate
    });
    showToast(`Donor ${fullName} registered with ID ${newId}`, 'success');
  }

  closeModal('modalDonor');
  await renderDonors();
}

function confirmDeleteDonor(id) {
  openConfirmModal(
    'Delete Donor',
    `Are you sure you want to delete donor ${id}? This action cannot be undone.`,
    async () => {
      await apiService.deleteDonor(id);
      showToast(`Donor ${id} record removed`, 'info');
      closeModal('modalConfirm');
      await renderDonors();
    }
  );
}

// --- BLOOD REQUEST MODAL HANDLERS ---

function openCreateRequestModal() {
  document.getElementById('requestModalTitle').textContent = 'Create Blood Request';
  document.getElementById('requestSubmitBtn').textContent = 'Submit Request';
  document.getElementById('requestIdHidden').value = '';
  document.getElementById('requestForm').reset();
  document.getElementById('reqStatusGroup').style.display = 'none';

  // Default request date to today
  document.getElementById('reqDate').value = new Date().toISOString().split('T')[0];
  openModal('modalRequest');
}

async function handleRequestFormSubmit(e) {
  e.preventDefault();

  const hiddenId = document.getElementById('requestIdHidden').value;
  const patientName = document.getElementById('reqPatientName').value.trim();
  const hospitalName = document.getElementById('reqHospitalName').value.trim();
  const bloodGroup = document.getElementById('reqBloodGroup').value;
  const units = parseInt(document.getElementById('reqUnits').value, 10);
  const contactPhone = document.getElementById('reqContactPhone').value.trim();
  const requestDate = document.getElementById('reqDate').value;
  const status = document.getElementById('reqStatus').value || 'Pending';

  if (units <= 0) {
    showToast('Requested units must be at least 1', 'danger');
    return;
  }

  if (hiddenId) {
    // Not currently exposed in basic flow
  } else {
    const newId = `REQ-${Math.floor(500 + Math.random() * 500)}`;
    await apiService.addRequest({
      id: newId,
      patientName,
      hospitalName,
      bloodGroup,
      units,
      contactPhone,
      requestDate,
      status: 'Pending'
    });
    showToast(`Requisition order ${newId} created for ${patientName}`, 'success');
  }

  closeModal('modalRequest');
  await renderRequests();
  await updateNotificationPopover();
}

function confirmDeleteRequest(id) {
  openConfirmModal(
    'Delete Blood Request',
    `Are you sure you want to delete requisition ${id}?`,
    async () => {
      await apiService.deleteRequest(id);
      showToast(`Request ${id} deleted`, 'info');
      closeModal('modalConfirm');
      await renderRequests();
      await updateNotificationPopover();
    }
  );
}

// --- LOG DONATION MODAL HANDLERS ---

async function openLogDonationModal() {
  const donors = await apiService.getDonors();
  const donorSelect = document.getElementById('donSelectDonor');
  
  document.getElementById('donationForm').reset();
  document.getElementById('donDate').value = new Date().toISOString().split('T')[0];

  // Populate registered donor options
  donorSelect.innerHTML = `<option value="">-- Choose Registered Donor --</option>` +
    donors.map(d => `<option value="${d.id}" data-group="${d.bloodGroup}" data-name="${escapeHtml(d.fullName)}">${d.fullName} (${d.id} - ${d.bloodGroup})</option>`).join('');

  openModal('modalDonation');
}

function handleDonorSelectForDonation() {
  const donorSelect = document.getElementById('donSelectDonor');
  const selectedOption = donorSelect.options[donorSelect.selectedIndex];
  const group = selectedOption.getAttribute('data-group') || '';
  document.getElementById('donBloodGroup').value = group;
}

async function handleDonationFormSubmit(e) {
  e.preventDefault();

  const donorSelect = document.getElementById('donSelectDonor');
  const donorId = donorSelect.value;
  const selectedOption = donorSelect.options[donorSelect.selectedIndex];
  const donorName = selectedOption.getAttribute('data-name');
  const bloodGroup = document.getElementById('donBloodGroup').value;
  const units = parseInt(document.getElementById('donUnits').value, 10);
  const donationDate = document.getElementById('donDate').value;
  const status = document.getElementById('donStatus').value;
  const autoAddInventory = document.getElementById('donAutoAddToInventory').checked;

  if (!donorId) {
    showToast('Please select a donor', 'danger');
    return;
  }

  const newDonationId = `DON-${Math.floor(200 + Math.random() * 800)}`;
  
  // 1. Add donation log
  await apiService.addDonation({
    id: newDonationId,
    donorId,
    donorName,
    bloodGroup,
    units,
    donationDate,
    status
  });

  // 2. Update donor's last donation date
  await apiService.updateDonor(donorId, { lastDonationDate: donationDate });

  // 3. Optional auto-add to inventory if completed
  if (autoAddInventory && status === 'Completed') {
    const newBatchId = `BAT-${Math.floor(1000 + Math.random() * 9000)}`;
    const expiryDate = new Date(donationDate);
    expiryDate.setDate(expiryDate.getDate() + 35);

    await apiService.addInventoryBatch({
      id: newBatchId,
      bloodGroup,
      units,
      collectionDate: donationDate,
      expiryDate: expiryDate.toISOString().split('T')[0],
      donorId,
      notes: `Collected via Donation ${newDonationId}`
    });
  }

  showToast(`Donation ${newDonationId} logged successfully!`, 'success');
  closeModal('modalDonation');
  await renderDonations();
  await updateNotificationPopover();
}

function confirmDeleteDonation(id) {
  openConfirmModal(
    'Delete Donation Record',
    `Are you sure you want to delete collection record ${id}?`,
    async () => {
      await apiService.deleteDonation(id);
      showToast(`Donation record ${id} removed`, 'info');
      closeModal('modalConfirm');
      await renderDonations();
    }
  );
}


/* ==============================================================================
   SECTION 14: UTILITIES (CSV EXPORT, DATE FORMATTERS, HELPERS)
   ============================================================================== */

/**
 * Calculate difference in days between target date and today
 * (Positive = Future, Negative = Past)
 */
function getDaysDifference(targetDateStr) {
  if (!targetDateStr) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDateStr);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Format ISO date string into readable Indian clinical date (DD-MM-YYYY)
 */
function formatDate(dateStr) {
  if (!dateStr) return '&mdash;';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
}

/**
 * Prevent HTML injection
 */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generic CSV exporter for browser downloads
 */
function exportToCSV(filename, rows) {
  const processRow = row => row.map(val => {
    let finalVal = val === null || val === undefined ? '' : String(val);
    finalVal = finalVal.replace(/"/g, '""');
    if (finalVal.search(/("|,|\n)/g) >= 0) {
      finalVal = `"${finalVal}"`;
    }
    return finalVal;
  }).join(',');

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(processRow).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast(`Exported ${filename} successfully`, 'success');
}

// Module CSV Exporters
async function exportInventoryCSV() {
  const inventory = await apiService.getInventory();
  const headers = ['Batch ID', 'Blood Group', 'Units', 'Collection Date', 'Expiry Date', 'Donor ID', 'Notes'];
  const rows = [headers, ...inventory.map(b => [b.id, b.bloodGroup, b.units, b.collectionDate, b.expiryDate, b.donorId || '', b.notes || ''])];
  exportToCSV('BBIMS_Blood_Inventory.csv', rows);
}

async function exportDonorsCSV() {
  const donors = await apiService.getDonors();
  const headers = ['Donor ID', 'Full Name', 'Age', 'Gender', 'Blood Group', 'Contact Number', 'City', 'Last Donation Date'];
  const rows = [headers, ...donors.map(d => [d.id, d.fullName, d.age, d.gender, d.bloodGroup, d.contactPhone, d.city, d.lastDonationDate || ''])];
  exportToCSV('BBIMS_Registered_Donors.csv', rows);
}

async function exportRequestsCSV() {
  const requests = await apiService.getRequests();
  const headers = ['Request ID', 'Patient Name', 'Hospital Name', 'Blood Group', 'Units', 'Contact Phone', 'Request Date', 'Status'];
  const rows = [headers, ...requests.map(r => [r.id, r.patientName, r.hospitalName, r.bloodGroup, r.units, r.contactPhone, r.requestDate, r.status])];
  exportToCSV('BBIMS_Blood_Requests.csv', rows);
}

async function exportDonationsCSV() {
  const donations = await apiService.getDonations();
  const headers = ['Donation ID', 'Donor ID', 'Donor Name', 'Blood Group', 'Units', 'Donation Date', 'Status'];
  const rows = [headers, ...donations.map(d => [d.id, d.donorId, d.donorName, d.bloodGroup, d.units, d.donationDate, d.status])];
  exportToCSV('BBIMS_Donation_Records.csv', rows);
}


/* ==============================================================================
   SECTION 15: DOM READY BOOTSTRAPPER & EVENT WIRING
   ============================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // 1. Sidebar Navigation Links Click Handling
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const viewId = link.getAttribute('data-view');
      navigateTo(viewId);
    });
  });

  // 2. Mobile Menu Toggles
  document.getElementById('mobileMenuBtn')?.addEventListener('click', openMobileSidebar);
  document.getElementById('sidebarCloseBtn')?.addEventListener('click', closeMobileSidebar);
  document.getElementById('sidebarOverlay')?.addEventListener('click', closeMobileSidebar);

  // 3. Notification Popover Toggle
  const notifBellBtn = document.getElementById('notifBellBtn');
  const notifPopover = document.getElementById('notifPopover');
  notifBellBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    notifPopover?.classList.toggle('active');
  });

  document.addEventListener('click', (e) => {
    if (notifPopover && !notifPopover.contains(e.target) && e.target !== notifBellBtn) {
      notifPopover.classList.remove('active');
    }
  });

  // 4. Compatibility Chart Modal Trigger
  document.getElementById('btnOpenCompatibility')?.addEventListener('click', () => {
    openModal('modalCompatibility');
  });

  // 5. Filter Inputs Realtime Listeners
  document.getElementById('inventorySearchInput')?.addEventListener('input', renderInventory);
  document.getElementById('inventoryGroupFilter')?.addEventListener('change', renderInventory);
  document.getElementById('inventoryStatusFilter')?.addEventListener('change', renderInventory);

  document.getElementById('donorSearchInput')?.addEventListener('input', renderDonors);
  document.getElementById('donorGroupFilter')?.addEventListener('change', renderDonors);
  document.getElementById('donorGenderFilter')?.addEventListener('change', renderDonors);

  document.getElementById('requestSearchInput')?.addEventListener('input', renderRequests);
  document.getElementById('requestStatusFilter')?.addEventListener('change', renderRequests);
  document.getElementById('requestGroupFilter')?.addEventListener('change', renderRequests);

  document.getElementById('donationSearchInput')?.addEventListener('input', renderDonations);
  document.getElementById('donationGroupFilter')?.addEventListener('change', renderDonations);
  document.getElementById('donationStatusFilter')?.addEventListener('change', renderDonations);

  // 6. Close Modal when clicking backdrop outside modal-content
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });

  // 7. Initial View Load
  navigateTo('dashboard');
});
