/**
 * ==============================================================================
 * BBIMS - Customer / Public Portal Controller & View Logic
 * ==============================================================================
 */

const CUSTOMER_CONFIG = {
  BASE_URL: (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin !== 'null' && !window.location.origin.startsWith('file:'))
    ? `${window.location.origin}/api` 
    : 'http://localhost:5000/api'
};

const customerPortal = {
  currentTab: 'stock',
  selectedCampForRsvp: null,

  init() {
    this.bindEvents();
    this.loadLiveStock();
    this.loadCamps();
    if (auth.isLoggedIn()) {
      this.loadMyRequests();
      this.prefillUserForms();
    }
  },

  bindEvents() {
    // Tab navigation buttons
    document.querySelectorAll('.cust-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = btn.getAttribute('data-cust-tab');
        if (tab) this.switchTab(tab);
      });
    });

    // Stock Filter Form
    const filterStockBtn = document.getElementById('btnFilterStock');
    if (filterStockBtn) {
      filterStockBtn.addEventListener('click', () => {
        const bg = document.getElementById('stockFilterGroup')?.value;
        const city = document.getElementById('stockFilterCity')?.value;
        this.loadLiveStock(bg, city);
      });
    }

    const resetStockBtn = document.getElementById('btnResetStock');
    if (resetStockBtn) {
      resetStockBtn.addEventListener('click', () => {
        const bgSelect = document.getElementById('stockFilterGroup');
        const cityInput = document.getElementById('stockFilterCity');
        if (bgSelect) bgSelect.value = '';
        if (cityInput) cityInput.value = '';
        this.loadLiveStock();
      });
    }

    // Requisition Submit Form
    const reqForm = document.getElementById('custRequisitionForm');
    if (reqForm) {
      reqForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleRequisitionSubmit();
      });
    }

    // Eligibility Checker Form
    const eligibilityForm = document.getElementById('custEligibilityForm');
    if (eligibilityForm) {
      eligibilityForm.addEventListener('input', () => this.evaluateEligibility());
    }

    // Donor Pledge Form
    const pledgeForm = document.getElementById('custPledgeForm');
    if (pledgeForm) {
      pledgeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handlePledgeSubmit();
      });
    }

    // Camps Search
    const searchCampInput = document.getElementById('campSearchInput');
    if (searchCampInput) {
      searchCampInput.addEventListener('input', (e) => {
        this.loadCamps(e.target.value.trim());
      });
    }

    // Camp RSVP Modal Form
    const rsvpForm = document.getElementById('campRsvpForm');
    if (rsvpForm) {
      rsvpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleRsvpSubmit();
      });
    }
  },

  switchTab(tabId) {
    this.currentTab = tabId;
    document.querySelectorAll('.cust-tab-btn').forEach(b => {
      if (b.getAttribute('data-cust-tab') === tabId) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    document.querySelectorAll('.cust-tab-pane').forEach(p => {
      p.classList.remove('active');
    });

    const activePane = document.getElementById(`custPane-${tabId}`);
    if (activePane) activePane.classList.add('active');

    if (tabId === 'stock') this.loadLiveStock();
    if (tabId === 'request' && auth.isLoggedIn()) this.loadMyRequests();
    if (tabId === 'camps') this.loadCamps();
  },

  prefillUserForms() {
    const user = auth.getUser();
    if (!user) return;

    // Prefill Requisition Form
    const reqPhone = document.getElementById('reqContactPhone');
    if (reqPhone && !reqPhone.value) reqPhone.value = user.contactPhone || '';

    // Prefill Pledge Form
    const pledgeName = document.getElementById('pledgeDonorName');
    const pledgePhone = document.getElementById('pledgeContactPhone');
    const pledgeGroup = document.getElementById('pledgeBloodGroup');
    const pledgeCity = document.getElementById('pledgeCity');

    if (pledgeName && !pledgeName.value) pledgeName.value = user.fullName || user.nodalOfficer || '';
    if (pledgePhone && !pledgePhone.value) pledgePhone.value = user.contactPhone || '';
    if (pledgeGroup && !pledgeGroup.value && user.bloodGroup) pledgeGroup.value = user.bloodGroup;
    if (pledgeCity && !pledgeCity.value && user.city) pledgeCity.value = user.city;
  },

  // --- TAB 1: LIVE STOCK FINDER ---
  async loadLiveStock(bloodGroup = '', city = '') {
    const container = document.getElementById('custStockGrid');
    if (!container) return;

    try {
      container.innerHTML = '<div class="cust-loading"><i class="fa-solid fa-spinner fa-spin"></i> Checking live regional blood inventory...</div>';

      const params = new URLSearchParams();
      if (bloodGroup) params.append('bloodGroup', bloodGroup);
      if (city) params.append('city', city);

      const res = await fetch(`${CUSTOMER_CONFIG.BASE_URL}/public/inventory?${params.toString()}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch inventory');
      }

      this.renderStockCards(data.summary, container);

      // Update Facility Info Card
      const facilityNameEl = document.getElementById('custFacilityName');
      const facilityCityEl = document.getElementById('custFacilityCity');
      const facilityPhoneEl = document.getElementById('custFacilityPhone');
      const totalUnitsEl = document.getElementById('custTotalUnits');

      if (facilityNameEl) facilityNameEl.textContent = data.facility.name;
      if (facilityCityEl) facilityCityEl.textContent = data.facility.city;
      if (facilityPhoneEl) facilityPhoneEl.textContent = data.facility.contactPhone;
      if (totalUnitsEl) totalUnitsEl.textContent = `${data.totalUnits} Units`;

    } catch (err) {
      container.innerHTML = `<div class="auth-alert auth-alert-danger"><i class="fa-solid fa-triangle-exclamation"></i> Error loading blood inventory: ${err.message}</div>`;
    }
  },

  renderStockCards(summary, container) {
    const groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    let html = '';

    groups.forEach(bg => {
      const info = summary[bg] || { units: 0, status: 'Out of Stock' };
      let badgeClass = 'badge-danger';
      let statusIcon = 'fa-triangle-exclamation';

      if (info.status === 'Available') {
        badgeClass = 'badge-success';
        statusIcon = 'fa-circle-check';
      } else if (info.status === 'Moderate') {
        badgeClass = 'badge-warning';
        statusIcon = 'fa-circle-exclamation';
      } else if (info.status === 'Critical') {
        badgeClass = 'badge-danger';
        statusIcon = 'fa-bell';
      } else {
        badgeClass = 'badge-light';
        statusIcon = 'fa-circle-xmark';
      }

      html += `
        <div class="cust-stock-card ${info.status === 'Critical' ? 'is-critical' : ''}">
          <div class="stock-card-top">
            <span class="blood-type-pill">${bg}</span>
            <span class="badge ${badgeClass}"><i class="fa-solid ${statusIcon}"></i> ${info.status}</span>
          </div>
          <div class="stock-card-body">
            <div class="units-display">
              <span class="units-num">${info.units}</span>
              <span class="units-label">Units Available</span>
            </div>
          </div>
          <div class="stock-card-footer">
            <button type="button" class="btn btn-sm btn-outline-primary w-100" onclick="customerPortal.quickRequest('${bg}')">
              <i class="fa-solid fa-hand-holding-medical"></i> Request ${bg}
            </button>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  quickRequest(bloodGroup) {
    this.switchTab('request');
    const groupSelect = document.getElementById('reqBloodGroup');
    if (groupSelect) {
      groupSelect.value = bloodGroup;
      groupSelect.scrollIntoView({ behavior: 'smooth', block: 'center' });
      groupSelect.focus();
    }
  },

  // --- TAB 2: REQUEST BLOOD & TRACKING ---
  async handleRequisitionSubmit() {
    const btn = document.getElementById('btnSubmitRequisition');
    const patientName = document.getElementById('reqPatientName')?.value.trim();
    const hospitalName = document.getElementById('reqHospitalName')?.value.trim();
    const bloodGroup = document.getElementById('reqBloodGroup')?.value;
    const units = document.getElementById('reqUnits')?.value;
    const contactPhone = document.getElementById('reqContactPhone')?.value.trim();

    if (!patientName || !hospitalName || !bloodGroup || !units || !contactPhone) {
      if (typeof showToast === 'function') showToast('Please fill all required requisition fields', 'warning');
      return;
    }

    try {
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting Requisition...';
      }

      const res = await fetch(`${CUSTOMER_CONFIG.BASE_URL}/customer/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.getToken()}`
        },
        body: JSON.stringify({
          patientName,
          hospitalName,
          bloodGroup,
          units: Number(units),
          contactPhone,
          requestDate: new Date().toISOString().split('T')[0]
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || (data.errors ? data.errors.join(', ') : 'Failed to submit requisition'));
      }

      if (typeof showToast === 'function') {
        showToast(`Blood Requisition ${data.data.id} submitted successfully! Our team will contact you shortly.`, 'success');
      }

      // Reset form
      document.getElementById('custRequisitionForm')?.reset();
      this.prefillUserForms();

      // Refresh tracking history
      await this.loadMyRequests();

    } catch (err) {
      if (typeof showToast === 'function') {
        showToast(err.message, 'danger');
      } else {
        alert(err.message);
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Submit Blood Requisition';
      }
    }
  },

  async loadMyRequests() {
    const tableBody = document.getElementById('custTrackingTableBody');
    const emptyState = document.getElementById('custTrackingEmpty');
    if (!tableBody) return;

    if (!auth.isLoggedIn()) {
      tableBody.innerHTML = '';
      if (emptyState) {
        emptyState.style.display = 'block';
        emptyState.innerHTML = '<i class="fa-solid fa-lock"></i><p>Sign in to view and track your submitted blood requisitions.</p>';
      }
      return;
    }

    try {
      const res = await fetch(`${CUSTOMER_CONFIG.BASE_URL}/customer/requests`, {
        headers: {
          'Authorization': `Bearer ${auth.getToken()}`
        }
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch personal tracking history');
      }

      const requests = data.data || [];
      if (requests.length === 0) {
        tableBody.innerHTML = '';
        if (emptyState) {
          emptyState.style.display = 'block';
          emptyState.innerHTML = '<i class="fa-regular fa-folder-open"></i><p>No requisitions submitted yet. Submit a request using the form on the left.</p>';
        }
        return;
      }

      if (emptyState) emptyState.style.display = 'none';

      let html = '';
      requests.forEach(r => {
        let statusBadge = 'badge-warning';
        if (r.status === 'Approved') statusBadge = 'badge-info';
        else if (r.status === 'Fulfilled') statusBadge = 'badge-success';
        else if (r.status === 'Rejected') statusBadge = 'badge-danger';

        html += `
          <tr>
            <td><strong>${r.id}</strong></td>
            <td>
              <div class="patient-cell">
                <span class="patient-name">${r.patientName}</span>
                <small class="hospital-name text-muted">${r.hospitalName}</small>
              </div>
            </td>
            <td><span class="blood-pill-sm">${r.bloodGroup}</span></td>
            <td>${r.units} Unit${r.units > 1 ? 's' : ''}</td>
            <td>${r.requestDate}</td>
            <td><span class="badge ${statusBadge}">${r.status}</span></td>
          </tr>
        `;
      });

      tableBody.innerHTML = html;
    } catch (err) {
      console.error('[Customer Portal] Error loading tracking requests:', err);
    }
  },

  // --- TAB 3: BECOME A DONOR & ELIGIBILITY ---
  evaluateEligibility() {
    const age = Number(document.getElementById('checkAge')?.value) || 0;
    const weight = Number(document.getElementById('checkWeight')?.value) || 0;
    const daysSince = Number(document.getElementById('checkDaysSince')?.value) || 0;
    const healthOk = document.getElementById('checkHealth')?.checked;
    const resultBox = document.getElementById('eligibilityResultBox');

    if (!resultBox) return;

    if (!age && !weight) {
      resultBox.className = 'eligibility-result-banner is-neutral';
      resultBox.innerHTML = `
        <i class="fa-solid fa-stethoscope"></i>
        <div>
          <h4>Standard Voluntary Donor Criteria</h4>
          <p>Age 18-65, weight >= 45kg, and at least 90 days interval between donations.</p>
        </div>
      `;
      return;
    }

    const reasons = [];
    if (age < 18 || age > 65) reasons.push('Donor must be between 18 and 65 years old');
    if (weight < 45) reasons.push('Donor body weight must be at least 45 kg');
    if (daysSince > 0 && daysSince < 90) reasons.push('Whole blood donation requires minimum 90 days between donations');
    if (!healthOk) reasons.push('Donor must be feeling healthy without active infection or antibiotics');

    if (reasons.length === 0) {
      resultBox.className = 'eligibility-result-banner is-eligible';
      resultBox.innerHTML = `
        <i class="fa-solid fa-circle-check"></i>
        <div>
          <h4>Congratulations! You are eligible to donate blood.</h4>
          <p>Your contribution can save up to 3 precious lives. Please choose a slot on the right to pledge your donation.</p>
        </div>
      `;
    } else {
      resultBox.className = 'eligibility-result-banner is-ineligible';
      resultBox.innerHTML = `
        <i class="fa-solid fa-triangle-exclamation"></i>
        <div>
          <h4>Temporary Deferral / Ineligibility</h4>
          <ul>${reasons.map(r => `<li>${r}</li>`).join('')}</ul>
        </div>
      `;
    }
  },

  async handlePledgeSubmit() {
    const btn = document.getElementById('btnSubmitPledge');
    const donorName = document.getElementById('pledgeDonorName')?.value.trim();
    const contactPhone = document.getElementById('pledgeContactPhone')?.value.trim();
    const bloodGroup = document.getElementById('pledgeBloodGroup')?.value;
    const appointmentDate = document.getElementById('pledgeDate')?.value;
    const preferredSlot = document.getElementById('pledgeSlot')?.value;
    const city = document.getElementById('pledgeCity')?.value.trim();

    if (!donorName || !contactPhone || !appointmentDate) {
      if (typeof showToast === 'function') showToast('Please enter donor name, phone and preferred date', 'warning');
      return;
    }

    try {
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Confirming Pledge...';
      }

      const res = await fetch(`${CUSTOMER_CONFIG.BASE_URL}/customer/donate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.getToken()}`
        },
        body: JSON.stringify({
          donorName,
          contactPhone,
          bloodGroup,
          appointmentDate,
          preferredSlot,
          city
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to register appointment');
      }

      if (typeof showToast === 'function') {
        showToast('Thank you for pledging to donate blood! Appointment confirmed.', 'success');
      }

      // Show alert box
      const alertEl = document.getElementById('pledgeSuccessAlert');
      if (alertEl) {
        alertEl.style.display = 'block';
        alertEl.innerHTML = `
          <i class="fa-solid fa-heart-circle-check"></i>
          <div>
            <strong>Pledge Confirmed (${data.data.id})!</strong>
            <p>We look forward to welcoming you on <strong>${appointmentDate}</strong> (${preferredSlot}) at ${data.data.campName || 'Central Blood Centre'}.</p>
          </div>
        `;
      }

    } catch (err) {
      if (typeof showToast === 'function') showToast(err.message, 'danger');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-hand-holding-heart"></i> Pledge & Schedule Donation';
      }
    }
  },

  // --- TAB 4: DONATION CAMPS & RSVP ---
  async loadCamps(searchQuery = '') {
    const container = document.getElementById('custCampsList');
    if (!container) return;

    try {
      container.innerHTML = '<div class="cust-loading"><i class="fa-solid fa-spinner fa-spin"></i> Loading upcoming voluntary camps...</div>';

      const url = searchQuery 
        ? `${CUSTOMER_CONFIG.BASE_URL}/public/camps?search=${encodeURIComponent(searchQuery)}`
        : `${CUSTOMER_CONFIG.BASE_URL}/public/camps`;

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to load camps');
      }

      const camps = data.data || [];
      if (camps.length === 0) {
        container.innerHTML = `
          <div class="empty-state-card">
            <i class="fa-regular fa-calendar-xmark"></i>
            <h4>No Upcoming Camps Found</h4>
            <p>No voluntary blood donation drives match your criteria right now.</p>
          </div>
        `;
        return;
      }

      let html = '';
      camps.forEach(c => {
        html += `
          <div class="camp-card">
            <div class="camp-card-badge">
              <i class="fa-solid fa-calendar-day"></i>
              <span>${c.campDate}</span>
            </div>
            <div class="camp-card-main">
              <h3 class="camp-title">${c.campName}</h3>
              <p class="camp-organizer"><i class="fa-solid fa-shield-halved text-primary"></i> ${c.organizer}</p>
              <div class="camp-meta-list">
                <span><i class="fa-solid fa-location-dot"></i> ${c.venue}, ${c.city}</span>
                <span><i class="fa-solid fa-clock"></i> ${c.campTime}</span>
                <span><i class="fa-solid fa-phone"></i> ${c.contactPhone}</span>
              </div>
            </div>
            <div class="camp-card-action">
              <div class="camp-counter">
                <strong>${c.registeredCount}</strong> / ${c.targetUnits}
                <small>Donors Registered</small>
              </div>
              <button type="button" class="btn btn-primary btn-sm" onclick="customerPortal.openRsvpModal('${c.id}', '${encodeURIComponent(c.campName)}', '${c.campDate}')">
                <i class="fa-solid fa-ticket"></i> RSVP / Book Slot
              </button>
            </div>
          </div>
        `;
      });

      container.innerHTML = html;
    } catch (err) {
      container.innerHTML = `<div class="auth-alert auth-alert-danger"><i class="fa-solid fa-triangle-exclamation"></i> Error loading camps: ${err.message}</div>`;
    }
  },

  openRsvpModal(campId, encodedCampName, campDate) {
    const campName = decodeURIComponent(encodedCampName);
    this.selectedCampForRsvp = { campId, campName, campDate };

    const modalTitle = document.getElementById('rsvpCampTitle');
    const modalDate = document.getElementById('rsvpCampDate');
    const modalCampId = document.getElementById('rsvpCampId');

    if (modalTitle) modalTitle.textContent = campName;
    if (modalDate) modalDate.textContent = `Date: ${campDate}`;
    if (modalCampId) modalCampId.value = campId;

    // Prefill with logged-in user if available
    const user = auth.getUser();
    if (user) {
      const nameInput = document.getElementById('rsvpDonorName');
      const phoneInput = document.getElementById('rsvpContactPhone');
      const groupInput = document.getElementById('rsvpBloodGroup');
      if (nameInput) nameInput.value = user.fullName || user.nodalOfficer || '';
      if (phoneInput) phoneInput.value = user.contactPhone || '';
      if (groupInput && user.bloodGroup) groupInput.value = user.bloodGroup;
    }

    const modal = document.getElementById('modalCampRsvp');
    if (modal) modal.classList.add('active');
  },

  closeRsvpModal() {
    const modal = document.getElementById('modalCampRsvp');
    if (modal) modal.classList.remove('active');
  },

  async handleRsvpSubmit() {
    const campId = document.getElementById('rsvpCampId')?.value;
    const donorName = document.getElementById('rsvpDonorName')?.value.trim();
    const contactPhone = document.getElementById('rsvpContactPhone')?.value.trim();
    const bloodGroup = document.getElementById('rsvpBloodGroup')?.value;
    const preferredSlot = document.getElementById('rsvpPreferredSlot')?.value;
    const btn = document.getElementById('btnSubmitRsvp');

    if (!donorName || !contactPhone) {
      if (typeof showToast === 'function') showToast('Please enter your name and contact phone', 'warning');
      return;
    }

    const campDate = this.selectedCampForRsvp?.campDate || new Date().toISOString().split('T')[0];
    const campName = this.selectedCampForRsvp?.campName || 'Voluntary Camp';

    try {
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Confirming RSVP...';
      }

      const res = await fetch(`${CUSTOMER_CONFIG.BASE_URL}/customer/donate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.getToken()}`
        },
        body: JSON.stringify({
          campId,
          campName,
          donorName,
          contactPhone,
          bloodGroup,
          appointmentDate: campDate,
          preferredSlot
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit RSVP');
      }

      this.closeRsvpModal();
      if (typeof showToast === 'function') {
        showToast(`RSVP Confirmed for ${campName}! Thank you for your support.`, 'success');
      }

      // Refresh camps list to reflect updated counter
      await this.loadCamps();

    } catch (err) {
      if (typeof showToast === 'function') showToast(err.message, 'danger');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Confirm RSVP';
      }
    }
  }
};

window.customerPortal = customerPortal;

// Bootstrap customer portal on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  customerPortal.init();
});
