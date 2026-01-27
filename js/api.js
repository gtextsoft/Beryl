// API Configuration
const API_BASE_URL = 'https://api.stephenakintayotv.com/api/v1/estate/detail';

// Product ID mapping
const PRODUCT_IDS = {
    'abeokuta': 13,
    'ibadan': 12,
    'kurudu': 6,
    'asaba': 5,
    'ibeju-lekki': 1
};

// Fetch estate data from API
async function fetchEstateData(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        const result = await response.json();
        
        if (result.success && result.data) {
            return result.data;
        } else {
            throw new Error(result.message || 'Failed to fetch estate data');
        }
    } catch (error) {
        console.error('Error fetching estate data:', error);
        return null;
    }
}

// Fetch multiple estates
async function fetchMultipleEstates(ids) {
    try {
        const promises = ids.map(id => fetchEstateData(id));
        const results = await Promise.all(promises);
        return results.filter(estate => estate !== null);
    } catch (error) {
        console.error('Error fetching multiple estates:', error);
        return [];
    }
}

// Format price
function formatPrice(price) {
    if (!price) return 'Contact for pricing';
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0
    }).format(parseFloat(price));
}

// Get product ID from page name
function getProductIdFromPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop().replace('.html', '');
    return PRODUCT_IDS[filename] || null;
}

// Render estate card
function renderEstateCard(estate, linkPath = '') {
    if (!estate) return '';
    
    const image = estate.preview_display_image || estate.map_background_image || 'images/placeholder.jpg';
    const title = estate.title || 'Estate';
    const location = `${estate.town_or_city || ''}, ${estate.state || ''}`.trim();
    const description = estate.description || estate.direction || 'Premium estate location';
    const price = estate.plot_detail ? formatPrice(estate.plot_detail.effective_price) : '';
    const badge = estate.plot_detail?.has_promotion ? '<span class="badge">Hot Deal</span>' : '';
    
    // Determine link - use product ID if available
    const productKey = Object.keys(PRODUCT_IDS).find(key => PRODUCT_IDS[key] === estate.id);
    const link = productKey ? `${linkPath}products/${productKey}.html` : '#';
    
    return `
        <div class="estate-card">
            <div class="estate-img">
                <img src="${image}" alt="${title}" onerror="this.src='images/placeholder.jpg'">
                ${badge}
            </div>
            <div class="estate-info">
                <h3>${location || title}</h3>
                <p>${description.substring(0, 100)}${description.length > 100 ? '...' : ''}</p>
                ${price ? `<p class="price" style="font-weight: bold; color: var(--secondary-color); margin: 10px 0;">${price}</p>` : ''}
                <a href="${link}" class="btn btn-outline">View Details</a>
            </div>
        </div>
    `;
}

// Render estate details page
function renderEstateDetails(estate) {
    if (!estate) {
        const pathPrefix = window.location.pathname.includes('/products/') ? '../' : '';
        document.body.innerHTML = `<div class="container" style="padding: 50px; text-align: center;"><h2>Estate not found</h2><p><a href="${pathPrefix}product/">Back to Products</a></p></div>`;
        return;
    }
    
    const pathPrefix = window.location.pathname.includes('/products/') ? '../' : '';
    const image = estate.preview_display_image || estate.map_background_image || 'images/placeholder.jpg';
    const title = estate.title || 'Estate';
    const location = `${estate.town_or_city || ''}, ${estate.state || ''}`.trim();
    const description = estate.description || '';
    const direction = estate.direction || '';
    const size = estate.size ? `${estate.size} acres` : '';
    const zoning = estate.zoning || '';
    const price = estate.plot_detail ? formatPrice(estate.plot_detail.effective_price) : '';
    const availablePlots = estate.plot_detail?.available_plot || 0;
    const amenities = estate.amenities || [];
    const photos = estate.media?.photos || [];
    
    // Update page title
    document.title = `${title} | Beryl Group Estate`;
    
    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.setAttribute('content', description.substring(0, 160));
    }
    
    // Update page header
    const pageHeader = document.querySelector('.page-header');
    if (pageHeader) {
        pageHeader.innerHTML = `
            <div class="container">
                <h1>${location || title}</h1>
                <p>${title}</p>
            </div>
        `;
        if (image) {
            pageHeader.style.backgroundImage = `linear-gradient(rgba(10, 35, 66, 0.8), rgba(10, 35, 66, 0.8)), url('${image}')`;
        }
    }
    
    // Update estate details section
    const detailsSection = document.querySelector('.estate-details');
    if (detailsSection) {
        detailsSection.innerHTML = `
            <div class="container">
                <div class="about-grid">
                    <div class="about-text">
                        <h2>Overview</h2>
                        <p>${description || 'Premium estate location with excellent investment potential.'}</p>
                        
                        ${direction ? `<h3>Location</h3><p>${direction}</p>` : ''}
                        
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0;">
                            ${size ? `<div><strong>Size:</strong> ${size}</div>` : ''}
                            ${zoning ? `<div><strong>Zoning:</strong> ${zoning}</div>` : ''}
                            ${price ? `<div><strong>Price:</strong> ${price}</div>` : ''}
                            ${availablePlots ? `<div><strong>Available Plots:</strong> ${availablePlots}</div>` : ''}
                        </div>
                        
                        ${amenities.length > 0 ? `
                            <h3>Amenities</h3>
                            <ul style="list-style: none; margin-bottom: 30px;">
                                ${amenities.map(amenity => `
                                    <li style="margin-bottom: 10px;">
                                        <i class="fas fa-check-circle" style="color: var(--secondary-color); margin-right: 10px;"></i>
                                        ${amenity}
                                    </li>
                                `).join('')}
                            </ul>
                        ` : ''}
                        
                        <div style="display: flex; gap: 15px; flex-wrap: wrap; margin-top: 30px;">
                            <a href="${pathPrefix}payment.html?estate=${estate.id}" class="btn btn-primary" style="flex: 1; min-width: 200px; text-align: center;">
                                <i class="fas fa-shopping-cart" style="margin-right: 8px;"></i>Buy Now
                            </a>
                            <a href="${pathPrefix}contact.html" class="btn btn-outline" style="flex: 1; min-width: 200px; text-align: center;">
                                <i class="fas fa-calendar-check" style="margin-right: 8px;"></i>Schedule Inspection
                            </a>
                        </div>
                        
                        ${estate.plot_detail?.installment_plan && estate.plot_detail.installment_plan.length > 0 ? `
                            <div style="margin-top: 20px; padding: 15px; background-color: #f4f4f4; border-radius: 4px;">
                                <p style="margin: 0; font-weight: 600; color: var(--primary-color);">
                                    <i class="fas fa-info-circle" style="margin-right: 8px;"></i>
                                    Flexible Payment Plans Available: ${estate.plot_detail.installment_plan.join(', ')}
                                </p>
                            </div>
                        ` : ''}
                    </div>
                    <div class="about-img">
                        <img src="${image}" alt="${title}" onerror="this.src='${pathPrefix}images/placeholder.jpg'">
                        ${photos.length > 0 ? `
                            <div style="margin-top: 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
                                ${photos.slice(0, 4).map(photo => `
                                    <img src="${photo}" alt="${title}" style="width: 100%; border-radius: 4px;" onerror="this.style.display='none'">
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }
}
