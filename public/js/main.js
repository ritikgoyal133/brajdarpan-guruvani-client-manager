/**
 * Main JavaScript for Brajdarpan Guruvani Kendra
 * Client Management System
 */

// Global AJAX error handler for session expiration
$(document).ajaxError(function(event, xhr, settings) {
  // Skip if it's the login request itself
  if (settings.url === '/login') {
    return;
  }
  
  // Check for session expiration
  if (xhr.status === 401 || xhr.status === 403 || 
      (xhr.responseURL && xhr.responseURL.includes('/login'))) {
    Swal.fire({
      icon: 'warning',
      title: 'Session Expired',
      text: 'Your session has expired. Redirecting to login...',
      confirmButtonColor: '#FF6B35',
      allowOutsideClick: false,
      allowEscapeKey: false,
      timer: 2000,
      showConfirmButton: false
    }).then(() => {
      window.location.href = '/login';
    });
  }
});

$(document).ready(function() {
  let clients = [];
  let editingClientId = null;
  let dataTable = null;

  // Initialize DataTable (only for desktop)
  if ($(window).width() >= 768) {
    dataTable = $('#clientsTable').DataTable({
      responsive: true,
      pageLength: 10,
      lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
      order: [[0, 'asc']],
      language: {
        search: "Search:",
        lengthMenu: "Show _MENU_ entries",
        info: "Showing _START_ to _END_ of _TOTAL_ clients",
        infoEmpty: "No clients found",
        infoFiltered: "(filtered from _MAX_ total clients)",
        zeroRecords: "No matching clients found",
        loadingRecords: "Loading clients..."
      },
      columnDefs: [
        { orderable: false, targets: 9 } // Actions column not sortable
      ],
      processing: true,
      serverSide: false
    });
  }

  // Load clients on page load
  loadClients();

  // Modal handlers
  $('#addClientBtn').on('click', function() {
    openModal('add');
  });

  $('#closeModal, #cancelBtn').on('click', function() {
    closeModal();
  });

  // Bootstrap modal close events
  $('#clientModal').on('hidden.bs.modal', function() {
    $('#clientForm')[0].reset();
    $('#clientId').val('');
    editingClientId = null;
  });

  // Form submission
  $('#clientForm').on('submit', function(e) {
    e.preventDefault();
    saveClient();
  });

  // Search/Filter handlers - integrate with DataTables
  $('#searchName, #searchMobile, #searchGender').on('input change', function() {
    filterClients();
  });

  $('#clearFiltersBtn').on('click', function() {
    clearFilters();
  });

  /**
   * Check if response indicates session expired
   */
  function checkSessionExpired(xhr) {
    // If redirected to login or unauthorized, session expired
    if (xhr.status === 401 || xhr.status === 403 || 
        xhr.responseURL && xhr.responseURL.includes('/login')) {
      return true;
    }
    return false;
  }

  /**
   * Redirect to login page
   */
  function redirectToLogin(message) {
    Swal.fire({
      icon: 'warning',
      title: 'Session Expired',
      text: message || 'Your session has expired. Please login again.',
      confirmButtonColor: '#FF6B35',
      allowOutsideClick: false,
      allowEscapeKey: false
    }).then(() => {
      window.location.href = '/login';
    });
  }

  /**
   * Load all clients from API
   */
  function loadClients() {
    $.ajax({
      url: '/api/clients',
      method: 'GET',
      success: function(response) {
        if (response.success) {
          clients = response.data;
          renderClients(clients);
        } else {
          // Failed to load clients - redirect to login
          redirectToLogin('Failed to load clients. Please login again.');
        }
      },
      error: function(xhr) {
        if (checkSessionExpired(xhr)) {
          redirectToLogin('Your session has expired. Please login again.');
        } else {
          redirectToLogin('Error loading clients. Please login again.');
        }
      }
    });
  }

  /**
   * Render clients table with DataTables
   */
  function renderClients(clientsToRender) {
    // Clear existing data (desktop table)
    if (dataTable) {
      dataTable.clear();
    }

    if (clientsToRender.length === 0) {
      if (dataTable) {
        dataTable.draw();
      }
      renderMobileList([]);
      return;
    }

    // Add rows to DataTable (Desktop only)
    if (dataTable) {
      clientsToRender.forEach(function(client) {
      const dobDisplay = formatDate(client.dob);
      const birthTimeDisplay = client.birthTime || '';
      const dobWithTime = birthTimeDisplay ? `${dobDisplay} ${birthTimeDisplay}` : dobDisplay;
      
      // Calculate remaining amount
      const chargeAmount = parseFloat(client.chargeableAmount || 0);
      const paidAmount = parseFloat(client.paidAmount || 0);
      const remainingAmount = chargeAmount - paidAmount;
      
      dataTable.row.add([
        escapeHtml(client.name || ''),
        escapeHtml(client.mobile || ''),
        escapeHtml(client.email || ''),
        dobWithTime,
        formatDate(client.dot),
        escapeHtml(client.gender || ''),
        formatCurrency(chargeAmount),
        formatCurrency(paidAmount),
        `<span class="${remainingAmount > 0 ? 'text-danger fw-bold' : 'text-success'}">${formatCurrency(remainingAmount)}</span>`,
        `<div class="btn-group" role="group">
          <button class="btn btn-sm btn-primary" onclick="editClient('${client.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteClient('${client.id}')">Delete</button>
        </div>`
      ]);
      });
      
      // Draw the table
      dataTable.draw();
    }
    
    // Render mobile list view
    renderMobileList(clientsToRender);
  }

  /**
   * Open modal for add/edit
   */
  function openModal(mode, clientId = null) {
    editingClientId = clientId;
    const modal = new bootstrap.Modal(document.getElementById('clientModal'));
    const form = $('#clientForm')[0];

    if (mode === 'add') {
      $('#modalTitle').text('Add New Client');
      form.reset();
      $('#clientId').val('');
      $('#birthTime').val('');
      editingClientId = null;
    } else if (mode === 'edit' && clientId) {
      $('#modalTitle').text('Edit Client');
      const client = clients.find(c => c.id === clientId);
      if (client) {
        $('#clientId').val(client.id);
        $('#name').val(client.name || '');
        $('#email').val(client.email || '');
        $('#mobile').val(client.mobile || '');
        $('#address').val(client.address || '');
        $('#dob').val(client.dob || '');
        $('#birthTime').val(client.birthTime || '');
        $('#dot').val(client.dot || '');
        $('#gender').val(client.gender || '');
        $('#problemStatement').val(client.problemStatement || '');
        $('#chargeableAmount').val(client.chargeableAmount || '');
        $('#paidAmount').val(client.paidAmount || '');
        editingClientId = clientId;
      }
    }

    modal.show();
  }

  /**
   * Close modal
   */
  function closeModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('clientModal'));
    if (modal) {
      modal.hide();
    }
  }

  /**
   * Save client (create or update)
   */
  function saveClient() {
    const formData = {
      name: $('#name').val().trim(),
      email: $('#email').val().trim(),
      mobile: $('#mobile').val().trim(),
      address: $('#address').val().trim(),
      dob: $('#dob').val(),
      birthTime: $('#birthTime').val(),
      dot: $('#dot').val(),
      gender: $('#gender').val(),
      problemStatement: $('#problemStatement').val().trim(),
      chargeableAmount: $('#chargeableAmount').val() || '0',
      paidAmount: $('#paidAmount').val() || '0'
    };

    // Validation - Required fields: name, gender, mobile, dob, birthTime, dot
    const errors = [];
    if (!formData.name) errors.push('Name');
    if (!formData.gender) errors.push('Gender');
    if (!formData.mobile) errors.push('Mobile Number');
    if (!formData.dob) errors.push('Date of Birth');
    if (!formData.birthTime) errors.push('Birth Time');
    if (!formData.dot) errors.push('Date of Visit');

    if (errors.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        html: `Please fill in all required fields:<br><strong>${errors.join(', ')}</strong>`,
        confirmButtonColor: '#FF6B35'
      });
      return;
    }

    const url = editingClientId 
      ? `/api/clients/${editingClientId}`
      : '/api/clients';
    const method = editingClientId ? 'PUT' : 'POST';

    $.ajax({
      url: url,
      method: method,
      contentType: 'application/json',
      data: JSON.stringify(formData),
      success: function(response) {
        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: response.message || 'Client saved successfully',
            confirmButtonColor: '#FF6B35',
            timer: 1500
          });
          closeModal();
          loadClients();
        } else {
          showError(response.message || 'Failed to save client');
        }
      },
      error: function(xhr) {
        if (checkSessionExpired(xhr)) {
          redirectToLogin('Your session has expired. Please login again.');
        } else {
          const message = xhr.responseJSON?.message || 'Error saving client';
          showError(message);
        }
      }
    });
  }

  /**
   * Edit client
   */
  window.editClient = function(clientId) {
    openModal('edit', clientId);
  };

  /**
   * Delete client with confirmation
   */
  window.deleteClient = function(clientId) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FF6B35',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        $.ajax({
          url: `/api/clients/${clientId}`,
          method: 'DELETE',
          success: function(response) {
            if (response.success) {
              Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Client has been deleted.',
                confirmButtonColor: '#FF6B35',
                timer: 1500
              });
              loadClients();
            } else {
              showError(response.message || 'Failed to delete client');
            }
          },
          error: function(xhr) {
            if (checkSessionExpired(xhr)) {
              redirectToLogin('Your session has expired. Please login again.');
            } else {
              const message = xhr.responseJSON?.message || 'Error deleting client';
              showError(message);
            }
          }
        });
      }
    });
  };

  /**
   * Filter clients based on search criteria
   */
  function filterClients() {
    const name = $('#searchName').val().toLowerCase();
    const mobile = $('#searchMobile').val();
    const gender = $('#searchGender').val();

    let filtered = clients;

    if (name) {
      filtered = filtered.filter(c => 
        c.name && c.name.toLowerCase().includes(name)
      );
    }

    if (mobile) {
      filtered = filtered.filter(c => 
        c.mobile && c.mobile.toString().includes(mobile)
      );
    }

    if (gender) {
      filtered = filtered.filter(c => c.gender === gender);
    }

    renderClients(filtered);
  }

  /**
   * Clear all filters
   */
  function clearFilters() {
    $('#searchName').val('');
    $('#searchMobile').val('');
    $('#searchGender').val('');
    dataTable.search('').draw(); // Clear DataTables search
    renderClients(clients);
  }

  /**
   * Show error alert
   */
  function showError(message) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      confirmButtonColor: '#FF6B35'
    });
  }

  /**
   * Format date for display
   */
  function formatDate(dateString) {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return dateString;
    }
  }

  /**
   * Format currency for display
   */
  function formatCurrency(amount) {
    const num = parseFloat(amount) || 0;
    return '₹' + num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /**
   * Render mobile list view
   */
  function renderMobileList(clientsToRender) {
    const mobileList = $('#mobileClientList');
    mobileList.empty();

    if (clientsToRender.length === 0) {
      mobileList.html('<div class="text-center py-4"><p class="text-muted">No clients found</p></div>');
      return;
    }

    clientsToRender.forEach(function(client) {
      const chargeAmount = parseFloat(client.chargeableAmount || 0);
      const paidAmount = parseFloat(client.paidAmount || 0);
      const remainingAmount = chargeAmount - paidAmount;
      const dobDisplay = formatDate(client.dob);
      const birthTimeDisplay = client.birthTime || '';
      const dobWithTime = birthTimeDisplay ? `${dobDisplay} ${birthTimeDisplay}` : dobDisplay;
      
      const card = `
        <div class="card mb-3 shadow-sm client-card-mobile">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h5 class="card-title mb-1">${escapeHtml(client.name || '')}</h5>
                <p class="text-muted small mb-0">${escapeHtml(client.gender || '')}</p>
              </div>
              <div class="btn-group" role="group">
                <button class="btn btn-sm btn-primary" onclick="editClient('${client.id}')">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteClient('${client.id}')">Delete</button>
              </div>
            </div>
            <hr class="my-2">
            <div class="row g-2">
              <div class="col-6">
                <small class="text-muted d-block">Mobile</small>
                <strong>${escapeHtml(client.mobile || '')}</strong>
              </div>
              <div class="col-6">
                <small class="text-muted d-block">Email</small>
                <strong class="text-break">${escapeHtml(client.email || '-')}</strong>
              </div>
              <div class="col-6">
                <small class="text-muted d-block">DOB & Time</small>
                <strong>${dobWithTime}</strong>
              </div>
              <div class="col-6">
                <small class="text-muted d-block">Date of Visit</small>
                <strong>${formatDate(client.dot)}</strong>
              </div>
              <div class="col-4">
                <small class="text-muted d-block">Charge Amount</small>
                <strong class="text-primary">${formatCurrency(chargeAmount)}</strong>
              </div>
              <div class="col-4">
                <small class="text-muted d-block">Paid Amount</small>
                <strong class="text-success">${formatCurrency(paidAmount)}</strong>
              </div>
              <div class="col-4">
                <small class="text-muted d-block">Remaining</small>
                <strong class="${remainingAmount > 0 ? 'text-danger' : 'text-success'}">${formatCurrency(remainingAmount)}</strong>
              </div>
              ${client.address ? `
              <div class="col-12">
                <small class="text-muted d-block">Address</small>
                <strong>${escapeHtml(client.address)}</strong>
              </div>
              ` : ''}
              ${client.problemStatement ? `
              <div class="col-12">
                <small class="text-muted d-block">Problem Statement</small>
                <strong>${escapeHtml(client.problemStatement)}</strong>
              </div>
              ` : ''}
            </div>
          </div>
        </div>
      `;
      mobileList.append(card);
    });
  }

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text ? text.toString().replace(/[&<>"']/g, m => map[m]) : '';
  }
});

