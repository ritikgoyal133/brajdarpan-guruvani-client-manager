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

  // Initialize DataTable
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
      { orderable: false, targets: 6 } // Actions column not sortable
    ],
    processing: true,
    serverSide: false
  });

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
    // Clear existing data
    dataTable.clear();

    if (clientsToRender.length === 0) {
      dataTable.draw();
      return;
    }

    // Add rows to DataTable
    clientsToRender.forEach(function(client) {
      const dobDisplay = formatDate(client.dob);
      const birthTimeDisplay = client.birthTime || '';
      const dobWithTime = birthTimeDisplay ? `${dobDisplay} ${birthTimeDisplay}` : dobDisplay;
      
      dataTable.row.add([
        escapeHtml(client.name || ''),
        escapeHtml(client.mobile || ''),
        escapeHtml(client.email || ''),
        dobWithTime,
        formatDate(client.dot),
        escapeHtml(client.gender || ''),
        `<div class="btn-group" role="group">
          <button class="btn btn-sm btn-primary" onclick="editClient('${client.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteClient('${client.id}')">Delete</button>
        </div>`
      ]);
    });

    // Draw the table
    dataTable.draw();
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
      problemStatement: $('#problemStatement').val().trim()
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

