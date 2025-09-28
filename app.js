// IC4G Product Catalog - Static JavaScript Version
// This runs entirely in the browser without any backend server

let allData = [];
let filteredData = [];
let currentPage = 1;
let resultsPerPage = 100;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadCatalogData();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Enter key in search box
    document.getElementById('searchQuery').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Filter changes
    document.getElementById('packageFilter').addEventListener('change', performSearch);
    document.getElementById('categoryFilter').addEventListener('change', performSearch);
    document.getElementById('sourceFilter').addEventListener('change', performSearch);
}

// Load catalog data from JSON file
async function loadCatalogData() {
    const statusDiv = document.getElementById('dataStatus');

    try {
        statusDiv.innerHTML = '<small>Loading catalog data...</small>';

        // Fetch the unified catalog data
        const response = await fetch('unified_catalog_data.json');

        if (!response.ok) {
            throw new Error('Failed to load catalog data');
        }

        allData = await response.json();

        // Update status
        const totalRecords = allData.length;
        const excelOnly = allData.filter(r => r.Source_Excel && !r.Source_PDF).length;
        const pdfOnly = allData.filter(r => !r.Source_Excel && r.Source_PDF).length;
        const both = allData.filter(r => r.Source_Excel && r.Source_PDF).length;

        statusDiv.className = 'alert alert-success';
        statusDiv.innerHTML = `
            <small>
                <strong>Data loaded successfully!</strong>
                Total: ${totalRecords.toLocaleString()} products |
                Excel only: ${excelOnly.toLocaleString()} |
                PDF only: ${pdfOnly.toLocaleString()} |
                Both sources: ${both.toLocaleString()}
            </small>
        `;

        // Populate filter dropdowns
        populateFilters();

    } catch (error) {
        console.error('Error loading data:', error);
        statusDiv.className = 'alert alert-danger';
        statusDiv.innerHTML = `
            <small>
                <strong>Error loading data:</strong> ${error.message}<br>
                Make sure unified_catalog_data.json is in the same directory as this HTML file.
            </small>
        `;
    }
}

// Populate filter dropdowns
function populateFilters() {
    // Get unique packages
    const packages = [...new Set(allData.map(r => r.Product_Package).filter(Boolean))].sort();
    const packageSelect = document.getElementById('packageFilter');
    packages.slice(0, 100).forEach(pkg => {
        const option = document.createElement('option');
        option.value = pkg;
        option.textContent = pkg.length > 50 ? pkg.substring(0, 47) + '...' : pkg;
        packageSelect.appendChild(option);
    });

    // Get unique categories
    const categories = [...new Set(allData.map(r => r.Product_Category_Group).filter(Boolean))].sort();
    const categorySelect = document.getElementById('categoryFilter');
    categories.slice(0, 100).forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat.length > 50 ? cat.substring(0, 47) + '...' : cat;
        categorySelect.appendChild(option);
    });
}

// Perform search with filters
function performSearch() {
    const query = document.getElementById('searchQuery').value.toLowerCase();
    const packageFilter = document.getElementById('packageFilter').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value.toLowerCase();
    const sourceFilter = document.getElementById('sourceFilter').value;
    resultsPerPage = parseInt(document.getElementById('resultsPerPage').value);

    // Filter the data
    filteredData = allData.filter(record => {
        // Text search
        if (query) {
            const searchableText = [
                record.Product_Package || '',
                record.Product_Description || '',
                record.Product_ID || '',
                record.Product_Category_Group || ''
            ].join(' ').toLowerCase();

            if (!searchableText.includes(query)) {
                return false;
            }
        }

        // Package filter
        if (packageFilter && !(record.Product_Package || '').toLowerCase().includes(packageFilter)) {
            return false;
        }

        // Category filter
        if (categoryFilter && !(record.Product_Category_Group || '').toLowerCase().includes(categoryFilter)) {
            return false;
        }

        // Source filter
        if (sourceFilter) {
            if (sourceFilter === 'excel' && !record.Source_Excel) return false;
            if (sourceFilter === 'pdf' && !record.Source_PDF) return false;
            if (sourceFilter === 'both' && !(record.Source_Excel && record.Source_PDF)) return false;
        }

        return true;
    });

    // Reset to first page
    currentPage = 1;

    // Display results
    displayResults();
}

// Display paginated results
function displayResults() {
    const container = document.getElementById('resultsContainer');
    const countBadge = document.getElementById('resultCount');
    const loadingDiv = document.getElementById('loadingIndicator');

    // Show loading briefly
    loadingDiv.classList.remove('d-none');

    setTimeout(() => {
        loadingDiv.classList.add('d-none');

        // Update count
        countBadge.textContent = filteredData.length.toLocaleString();

        if (filteredData.length === 0) {
            container.innerHTML = '<p class="text-muted">No products found matching your criteria.</p>';
            document.getElementById('paginationTop').innerHTML = '';
            document.getElementById('paginationBottom').innerHTML = '';
            document.getElementById('paginationInfo').textContent = '';
            return;
        }

        // Calculate pagination
        const startIndex = (currentPage - 1) * resultsPerPage;
        const endIndex = Math.min(startIndex + resultsPerPage, filteredData.length);
        const pageData = filteredData.slice(startIndex, endIndex);

        // Update pagination info
        document.getElementById('paginationInfo').textContent =
            `Showing ${startIndex + 1}-${endIndex} of ${filteredData.length}`;

        // Build table
        let html = `
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>Package</th>
                        <th>Description</th>
                        <th>Product ID</th>
                        <th>Category</th>
                        <th>Capacity</th>
                        <th>Price (Monthly)</th>
                        <th>Source</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        pageData.forEach((record, index) => {
            const sources = [];
            if (record.Source_Excel) sources.push('Excel');
            if (record.Source_PDF) sources.push('PDF');

            html += `
                <tr>
                    <td>${record.Product_Package || '-'}</td>
                    <td>${truncateText(record.Product_Description, 50)}</td>
                    <td>${record.Product_ID || '-'}</td>
                    <td>${record.Product_Category_Group || '-'}</td>
                    <td>${record.Product_Capacity || '-'} ${record.Product_Unit_of_Measure || ''}</td>
                    <td>${formatPrice(record.Price_Monthly)}</td>
                    <td>
                        <span class="badge bg-${sources.length === 2 ? 'success' : 'secondary'}">
                            ${sources.join(', ') || 'Unknown'}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="showDetails(${startIndex + index})">
                            Details
                        </button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        container.innerHTML = html;

        // Update pagination controls
        updatePagination();

    }, 100);
}

// Update pagination controls
function updatePagination() {
    const totalPages = Math.ceil(filteredData.length / resultsPerPage);

    if (totalPages <= 1) {
        document.getElementById('paginationTop').innerHTML = '';
        document.getElementById('paginationBottom').innerHTML = '';
        return;
    }

    let paginationHtml = '<nav><ul class="pagination justify-content-center">';

    // Previous button
    paginationHtml += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage - 1}); return false;">Previous</a>
        </li>
    `;

    // Page numbers
    const maxPages = 10;
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);

    if (endPage - startPage < maxPages - 1) {
        startPage = Math.max(1, endPage - maxPages + 1);
    }

    if (startPage > 1) {
        paginationHtml += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="changePage(1); return false;">1</a>
            </li>
        `;
        if (startPage > 2) {
            paginationHtml += '<li class="page-item disabled"><span class="page-link">...</span></li>';
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationHtml += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changePage(${i}); return false;">${i}</a>
            </li>
        `;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHtml += '<li class="page-item disabled"><span class="page-link">...</span></li>';
        }
        paginationHtml += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="changePage(${totalPages}); return false;">${totalPages}</a>
            </li>
        `;
    }

    // Next button
    paginationHtml += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage + 1}); return false;">Next</a>
        </li>
    `;

    paginationHtml += '</ul></nav>';

    document.getElementById('paginationTop').innerHTML = paginationHtml;
    document.getElementById('paginationBottom').innerHTML = paginationHtml;
}

// Change page
function changePage(page) {
    const totalPages = Math.ceil(filteredData.length / resultsPerPage);

    if (page < 1 || page > totalPages) return;

    currentPage = page;
    displayResults();

    // Scroll to top of results
    document.querySelector('.card').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Show product details
function showDetails(index) {
    const record = filteredData[index];
    if (!record) return;

    const sources = [];
    if (record.Source_Excel) sources.push('Excel');
    if (record.Source_PDF) sources.push('PDF');

    const detailHtml = `
        <div class="row">
            <div class="col-md-6">
                <h6>Product Information</h6>
                <table class="table table-sm">
                    <tr><th>Package:</th><td>${record.Product_Package || '-'}</td></tr>
                    <tr><th>Package ID:</th><td>${record.Product_Package_ID || '-'}</td></tr>
                    <tr><th>Product ID:</th><td>${record.Product_ID || '-'}</td></tr>
                    <tr><th>Description:</th><td>${record.Product_Description || '-'}</td></tr>
                    <tr><th>Category Group:</th><td>${record.Product_Category_Group || '-'}</td></tr>
                    <tr><th>Category SubGroup:</th><td>${record.Product_Category_SubGroup || '-'}</td></tr>
                    <tr><th>Catalog Name:</th><td>${record.Catalog_Name || '-'}</td></tr>
                </table>
            </div>
            <div class="col-md-6">
                <h6>Capacity & Pricing</h6>
                <table class="table table-sm">
                    <tr><th>Capacity:</th><td>${record.Product_Capacity || '-'}</td></tr>
                    <tr><th>Unit of Measure:</th><td>${record.Product_Unit_of_Measure || '-'}</td></tr>
                    <tr><th>Price Hourly:</th><td>${formatPrice(record.Price_Hourly)}</td></tr>
                    <tr><th>Price Monthly:</th><td>${formatPrice(record.Price_Monthly)}</td></tr>
                    <tr><th>Price One-Time:</th><td>${formatPrice(record.Price_OneTime)}</td></tr>
                    <tr><th>Price Setup:</th><td>${formatPrice(record.Price_Setup)}</td></tr>
                    <tr><th>Charge Basis:</th><td>${record.Price_Charge_Basis || '-'}</td></tr>
                    <tr><th>Data Sources:</th><td><span class="badge bg-primary">${sources.join(', ')}</span></td></tr>
                </table>
            </div>
        </div>
    `;

    document.getElementById('detailContent').innerHTML = detailHtml;

    const modal = new bootstrap.Modal(document.getElementById('detailModal'));
    modal.show();
}

// Clear search and filters
function clearSearch() {
    document.getElementById('searchQuery').value = '';
    document.getElementById('packageFilter').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('sourceFilter').value = '';
    filteredData = [];
    document.getElementById('resultsContainer').innerHTML = '<p class="text-muted">Enter search criteria above to find products, or click "Show All" to view all products.</p>';
    document.getElementById('resultCount').textContent = '0';
    document.getElementById('paginationTop').innerHTML = '';
    document.getElementById('paginationBottom').innerHTML = '';
    document.getElementById('paginationInfo').textContent = '';
}

// Load all data
function loadAllData() {
    document.getElementById('searchQuery').value = '';
    document.getElementById('packageFilter').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('sourceFilter').value = '';
    filteredData = [...allData];
    currentPage = 1;
    displayResults();
}

// Helper functions
function truncateText(text, maxLength) {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function formatPrice(price) {
    if (!price || price === 0) return '-';
    return '$' + parseFloat(price).toFixed(2);
}

// Export functionality
function exportToCSV() {
    if (filteredData.length === 0) {
        alert('No data to export. Please perform a search first.');
        return;
    }

    // Prepare CSV headers
    const headers = [
        'Product_Package',
        'Product_Package_ID',
        'Product_ID',
        'Product_Description',
        'Product_Category_Group',
        'Product_Category_SubGroup',
        'Product_Capacity',
        'Product_Unit_of_Measure',
        'Price_Hourly',
        'Price_Monthly',
        'Price_OneTime',
        'Price_Setup',
        'Price_Charge_Basis',
        'Source_Excel',
        'Source_PDF',
        'Catalog_Name'
    ];

    // Build CSV content
    let csvContent = headers.join(',') + '\n';

    filteredData.forEach(record => {
        const row = headers.map(header => {
            let value = record[header];

            // Handle null/undefined
            if (value === null || value === undefined) {
                return '';
            }

            // Handle booleans
            if (typeof value === 'boolean') {
                return value ? 'Yes' : 'No';
            }

            // Handle strings that might contain commas or quotes
            value = String(value);
            if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                value = '"' + value.replace(/"/g, '""') + '"';
            }

            return value;
        });

        csvContent += row.join(',') + '\n';
    });

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'ic4g-catalog-export.csv');
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function exportToJSON() {
    if (filteredData.length === 0) {
        alert('No data to export. Please perform a search first.');
        return;
    }

    // Create formatted JSON
    const jsonData = JSON.stringify(filteredData, null, 2);

    // Create blob and download
    const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'ic4g-catalog-export.json');
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}