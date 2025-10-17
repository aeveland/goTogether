/**
 * Trip Page Component
 * Detailed view of a specific trip with shopping lists, todos, and notes
 */
import { ApiService } from '../utils/api.js';

export class TripPage {
    constructor(props = {}) {
        this.props = props;
        this.tripId = props.tripId;
        this.apiService = new ApiService();
        this.trip = null;
        this.shoppingItems = [];
        this.activeTab = 'overview';
        
        // Make this instance globally accessible
        window.tripPage = this;
        
        // Bind methods
        this.handleTabChange = this.handleTabChange.bind(this);
    }

    /**
     * Render the trip page
     * @returns {HTMLElement} - The rendered page element
     */
    render() {
        const container = document.createElement('div');
        container.className = 'fade-in';
        
        container.innerHTML = `
            <!-- App Bar -->
            <div class="app-bar">
                <div class="d-flex align-center">
                    <button class="mdc-button" data-route="/dashboard">
                        <span class="mdc-button__ripple"></span>
                        <i class="material-icons mdc-button__icon">arrow_back</i>
                        <span class="mdc-button__label">Back</span>
                    </button>
                    <h1 class="app-bar-title ml-3">Trip Details</h1>
                </div>
                <div class="app-bar-actions">
                    <button class="mdc-button" id="invite-btn">
                        <span class="mdc-button__ripple"></span>
                        <i class="material-icons mdc-button__icon">person_add</i>
                        <span class="mdc-button__label">Invite</span>
                    </button>
                </div>
            </div>

            <div class="page-container">
                <!-- Loading State -->
                <div id="loading-state" class="text-center p-4">
                    <div class="mdc-circular-progress" style="width:48px;height:48px;" role="progressbar">
                        <div class="mdc-circular-progress__indeterminate-container">
                            <div class="mdc-circular-progress__spinner-layer">
                                <div class="mdc-circular-progress__circle-clipper mdc-circular-progress__circle-left">
                                    <svg class="mdc-circular-progress__indeterminate-circle-graphic" viewBox="0 0 48 48">
                                        <circle cx="24" cy="24" r="18" stroke-dasharray="113.097" stroke-dashoffset="56.549" stroke-width="4"/>
                                    </svg>
                                </div>
                                <div class="mdc-circular-progress__gap-patch">
                                    <svg class="mdc-circular-progress__indeterminate-circle-graphic" viewBox="0 0 48 48">
                                        <circle cx="24" cy="24" r="18" stroke-dasharray="113.097" stroke-dashoffset="56.549" stroke-width="3.2"/>
                                    </svg>
                                </div>
                                <div class="mdc-circular-progress__circle-clipper mdc-circular-progress__circle-right">
                                    <svg class="mdc-circular-progress__indeterminate-circle-graphic" viewBox="0 0 48 48">
                                        <circle cx="24" cy="24" r="18" stroke-dasharray="113.097" stroke-dashoffset="56.549" stroke-width="4"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p class="mt-2">Loading trip details...</p>
                </div>

                <!-- Trip Content -->
                <div id="trip-content" class="d-none">
                    <!-- Trip Header -->
                    <div id="trip-header" class="mb-4"></div>

                    <!-- Tab Bar -->
                    <div class="mdc-tab-bar" role="tablist" id="trip-tabs">
                        <div class="mdc-tab-scroller">
                            <div class="mdc-tab-scroller__scroll-area">
                                <div class="mdc-tab-scroller__scroll-content">
                                    <button class="mdc-tab mdc-tab--active" role="tab" data-tab="overview">
                                        <span class="mdc-tab__content">
                                            <span class="mdc-tab__icon material-icons">info</span>
                                            <span class="mdc-tab__text-label">Overview</span>
                                        </span>
                                        <span class="mdc-tab-indicator mdc-tab-indicator--active">
                                            <span class="mdc-tab-indicator__content mdc-tab-indicator__content--underline"></span>
                                        </span>
                                        <span class="mdc-tab__ripple"></span>
                                    </button>
                                    <button class="mdc-tab" role="tab" data-tab="shopping">
                                        <span class="mdc-tab__content">
                                            <span class="mdc-tab__icon material-icons">shopping_cart</span>
                                            <span class="mdc-tab__text-label">Shopping</span>
                                        </span>
                                        <span class="mdc-tab-indicator">
                                            <span class="mdc-tab-indicator__content mdc-tab-indicator__content--underline"></span>
                                        </span>
                                        <span class="mdc-tab__ripple"></span>
                                    </button>
                                    <button class="mdc-tab" role="tab" data-tab="todos">
                                        <span class="mdc-tab__content">
                                            <span class="mdc-tab__icon material-icons">checklist</span>
                                            <span class="mdc-tab__text-label">To-Dos</span>
                                        </span>
                                        <span class="mdc-tab-indicator">
                                            <span class="mdc-tab-indicator__content mdc-tab-indicator__content--underline"></span>
                                        </span>
                                        <span class="mdc-tab__ripple"></span>
                                    </button>
                                    <button class="mdc-tab" role="tab" data-tab="notes">
                                        <span class="mdc-tab__content">
                                            <span class="mdc-tab__icon material-icons">note</span>
                                            <span class="mdc-tab__text-label">Notes</span>
                                        </span>
                                        <span class="mdc-tab-indicator">
                                            <span class="mdc-tab-indicator__content mdc-tab-indicator__content--underline"></span>
                                        </span>
                                        <span class="mdc-tab__ripple"></span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Tab Content -->
                    <div id="tab-content" class="mt-4"></div>
                </div>
            </div>
        `;

        // Add event listeners
        this.attachEventListeners(container);
        
        // Load trip data
        this.loadTrip();

        return container;
    }

    /**
     * Attach event listeners
     * @param {HTMLElement} container - The container element
     */
    attachEventListeners(container) {
        // Tab navigation
        const tabs = container.querySelectorAll('.mdc-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', this.handleTabChange);
        });

        // Invite button
        const inviteBtn = container.querySelector('#invite-btn');
        inviteBtn?.addEventListener('click', this.handleInvite.bind(this));
        
        // Add shopping item button (will be added when shopping tab is rendered)
        this.attachShoppingEventListeners();
    }

    /**
     * Load trip data from API
     */
    async loadTripData() {
        try {
            const trip = await this.apiService.getTrip(this.tripId);
            this.trip = trip.data;
            this.renderTripHeader();
            
            // Load shopping list data
            await this.loadShoppingList();
            
            this.renderTabContent('overview');
        } catch (error) {
            console.error('Error loading trip:', error);
            this.showError('Failed to load trip details');
        }
    }

    async loadShoppingList() {
        try {
            const response = await this.apiService.getShoppingList(this.tripId);
            this.shoppingItems = response.data || [];
            console.log('Shopping list loaded:', this.shoppingItems);
        } catch (error) {
            console.error('Error loading shopping list:', error);
            this.shoppingItems = [];
        }
    }

    /**
     * Render trip content
     */
    renderTripContent() {
        const tripContent = document.getElementById('trip-content');
        const tripHeader = document.getElementById('trip-header');
        
        if (tripHeader && this.trip) {
            tripHeader.innerHTML = this.renderTripHeader();
        }
        
        tripContent?.classList.remove('d-none');
        
        // Render initial tab content
        this.renderTabContent();
    }

    /**
     * Render trip header
     * @returns {string} - HTML string for trip header
     */
    renderTripHeader() {
        if (!this.trip) return '';

        const startDate = new Date(this.trip.start_date);
        const endDate = new Date(this.trip.end_date);

        return `
            <div class="mdc-card">
                <div class="mdc-card__content">
                    <h2 class="mdc-typography--headline5 mb-2">${this.trip.name}</h2>
                    <div class="d-flex flex-column gap-2">
                        <div class="d-flex align-center">
                            <i class="material-icons mr-2">location_on</i>
                            <span>${this.trip.location}</span>
                        </div>
                        <div class="d-flex align-center">
                            <i class="material-icons mr-2">date_range</i>
                            <span>${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</span>
                        </div>
                        <div class="d-flex align-center">
                            <i class="material-icons mr-2">group</i>
                            <span>${this.trip.member_count || 0} members</span>
                        </div>
                    </div>
                    ${this.trip.description ? `
                        <p class="mdc-typography--body2 mt-3">${this.trip.description}</p>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Handle tab change
     * @param {Event} event - Click event
     */
    handleTabChange(event) {
        const tab = event.currentTarget;
        const tabName = tab.getAttribute('data-tab');
        
        if (tabName && tabName !== this.activeTab) {
            // Update active tab
            document.querySelectorAll('.mdc-tab').forEach(t => {
                t.classList.remove('mdc-tab--active');
                t.querySelector('.mdc-tab-indicator').classList.remove('mdc-tab-indicator--active');
            });
            
            tab.classList.add('mdc-tab--active');
            tab.querySelector('.mdc-tab-indicator').classList.add('mdc-tab-indicator--active');
            
            this.activeTab = tabName;
            this.renderTabContent();
        }
    }

    /**
     * Render content for active tab
     */
    renderTabContent() {
        const tabContent = document.getElementById('tab-content');
        if (!tabContent) return;

        switch (this.activeTab) {
            case 'overview':
                tabContent.innerHTML = this.renderOverviewTab();
                break;
            case 'shopping':
                tabContent.innerHTML = this.renderShoppingTab();
                // Re-attach shopping event listeners after rendering
                this.attachShoppingEventListeners();
                break;
            case 'todos':
                tabContent.innerHTML = this.renderTodosTab();
                break;
            case 'notes':
                tabContent.innerHTML = this.renderNotesTab();
                break;
            default:
                tabContent.innerHTML = '<p>Tab content not found</p>';
        }
    }

    /**
     * Render overview tab content
     * @returns {string} - HTML string
     */
    renderOverviewTab() {
        return `
            <div class="slide-up">
                <h3 class="mdc-typography--headline6 mb-3">Trip Overview</h3>
                <div class="card-grid">
                    <div class="mdc-card">
                        <div class="mdc-card__content text-center">
                            <i class="material-icons" style="font-size: 48px; color: var(--mdc-theme-primary);">shopping_cart</i>
                            <h4 class="mdc-typography--headline6">Shopping List</h4>
                            <p class="mdc-typography--body2">Shared shopping list for the trip</p>
                            <button class="mdc-button mdc-button--outlined" data-tab-switch="shopping">
                                <span class="mdc-button__label">View Shopping List</span>
                            </button>
                        </div>
                    </div>
                    <div class="mdc-card">
                        <div class="mdc-card__content text-center">
                            <i class="material-icons" style="font-size: 48px; color: var(--mdc-theme-primary);">checklist</i>
                            <h4 class="mdc-typography--headline6">To-Do List</h4>
                            <p class="mdc-typography--body2">Tasks and preparations for the trip</p>
                            <button class="mdc-button mdc-button--outlined" data-tab-switch="todos">
                                <span class="mdc-button__label">View To-Dos</span>
                            </button>
                        </div>
                    </div>
                    <div class="mdc-card">
                        <div class="mdc-card__content text-center">
                            <i class="material-icons" style="font-size: 48px; color: var(--mdc-theme-primary);">note</i>
                            <h4 class="mdc-typography--headline6">Notes</h4>
                            <p class="mdc-typography--body2">Shared notes and information</p>
                            <button class="mdc-button mdc-button--outlined" data-tab-switch="notes">
                                <span class="mdc-button__label">View Notes</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render shopping tab content
     * @returns {string} - HTML string
     */
    renderShoppingTab() {
        const items = this.shoppingItems || [];
        const categories = ['shelter', 'sleeping', 'cooking', 'water', 'comfort', 'other'];
        
        return `
            <div class="slide-up">
                <div class="d-flex justify-between align-center mb-3">
                    <h3 class="mdc-typography--headline6">Shopping List</h3>
                    <button class="mdc-button mdc-button--raised" id="add-shopping-item">
                        <span class="mdc-button__ripple"></span>
                        <i class="material-icons mdc-button__icon">add</i>
                        <span class="mdc-button__label">Add Item</span>
                    </button>
                </div>
                
                ${items.length === 0 ? `
                    <div class="text-center p-4">
                        <i class="material-icons" style="font-size: 64px; color: #ccc;">shopping_cart</i>
                        <p class="mdc-typography--body1">No items in shopping list yet</p>
                        <p class="mdc-typography--body2">Add items to start planning what to bring!</p>
                    </div>
                ` : `
                    <div class="shopping-list">
                        ${categories.map(category => {
                            const categoryItems = items.filter(item => item.category === category);
                            if (categoryItems.length === 0) return '';
                            
                            return `
                                <div class="category-section mb-4">
                                    <h4 class="mdc-typography--subtitle1 mb-2" style="text-transform: capitalize; color: #1976d2;">
                                        <i class="material-icons" style="vertical-align: middle; margin-right: 8px;">
                                            ${this.getCategoryIcon(category)}
                                        </i>
                                        ${category}
                                    </h4>
                                    <div class="shopping-items">
                                        ${categoryItems.map(item => `
                                            <div class="mdc-card shopping-item ${item.purchased ? 'purchased' : ''}" style="margin-bottom: 8px;">
                                                <div class="mdc-card__content" style="padding: 12px;">
                                                    <div class="d-flex align-center">
                                                        <div class="mdc-checkbox">
                                                            <input type="checkbox" class="mdc-checkbox__native-control" 
                                                                   ${item.purchased ? 'checked' : ''} 
                                                                   onchange="window.tripPage?.togglePurchased(${item.id})">
                                                            <div class="mdc-checkbox__background">
                                                                <svg class="mdc-checkbox__checkmark" viewBox="0 0 24 24">
                                                                    <path class="mdc-checkbox__checkmark-path" fill="none" d="M1.73,12.91 8.1,19.28 22.79,4.59"/>
                                                                </svg>
                                                            </div>
                                                        </div>
                                                        <div class="flex-1 ml-3">
                                                            <div class="d-flex justify-between align-center">
                                                                <span class="mdc-typography--body1 ${item.purchased ? 'text-muted' : ''}" 
                                                                      style="${item.purchased ? 'text-decoration: line-through;' : ''}">
                                                                    <strong>${item.name}</strong>
                                                                    ${item.quantity > 1 ? ` (${item.quantity})` : ''}
                                                                </span>
                                                                <div class="item-actions">
                                                                    ${item.amazon_url ? `
                                                                        <button class="mdc-icon-button" onclick="window.open('${item.amazon_url}', '_blank')" title="View on Amazon">
                                                                            <i class="material-icons">shopping_basket</i>
                                                                        </button>
                                                                    ` : ''}
                                                                    <button class="mdc-icon-button" onclick="window.tripPage?.editShoppingItem(${item.id})" title="Edit">
                                                                        <i class="material-icons">edit</i>
                                                                    </button>
                                                                    <button class="mdc-icon-button" onclick="window.tripPage?.deleteShoppingItem(${item.id})" title="Delete">
                                                                        <i class="material-icons">delete</i>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            ${item.notes ? `
                                                                <p class="mdc-typography--body2 text-muted mt-1">${item.notes}</p>
                                                            ` : ''}
                                                            ${item.assigned_to ? `
                                                                <p class="mdc-typography--caption text-muted">Assigned to: User ${item.assigned_to}</p>
                                                            ` : ''}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `}
            </div>
        `;
    }

    getCategoryIcon(category) {
        const icons = {
            shelter: 'home',
            sleeping: 'hotel',
            cooking: 'restaurant',
            water: 'local_drink',
            comfort: 'weekend',
            other: 'category'
        };
        return icons[category] || 'category';
    }

    /**
     * Render todos tab content
     * @returns {string} - HTML string
     */
    renderTodosTab() {
        return `
            <div class="slide-up">
                <div class="d-flex justify-between align-center mb-3">
                    <h3 class="mdc-typography--headline6">To-Do List</h3>
                    <button class="mdc-button mdc-button--raised">
                        <span class="mdc-button__ripple"></span>
                        <i class="material-icons mdc-button__icon">add</i>
                        <span class="mdc-button__label">Add Task</span>
                    </button>
                </div>
                <div class="text-center p-4">
                    <i class="material-icons" style="font-size: 64px; color: #ccc;">checklist</i>
                    <p class="mdc-typography--body1">To-do list functionality coming soon!</p>
                </div>
            </div>
        `;
    }

    /**
     * Render notes tab content
     * @returns {string} - HTML string
     */
    renderNotesTab() {
        return `
            <div class="slide-up">
                <div class="d-flex justify-between align-center mb-3">
                    <h3 class="mdc-typography--headline6">Notes</h3>
                    <button class="mdc-button mdc-button--raised">
                        <span class="mdc-button__ripple"></span>
                        <i class="material-icons mdc-button__icon">add</i>
                        <span class="mdc-button__label">Add Note</span>
                    </button>
                </div>
                <div class="text-center p-4">
                    <i class="material-icons" style="font-size: 64px; color: #ccc;">note</i>
                    <p class="mdc-typography--body1">Notes functionality coming soon!</p>
                </div>
            </div>
        `;
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        const loadingState = document.getElementById('loading-state');
        loadingState?.classList.add('d-none');
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        alert(message);
    }

    /**
     * Handle invite functionality
     */
    handleInvite() {
        alert('Invite functionality coming soon!');
    }

    /**
     * Attach event listeners for shopping functionality
     */
    attachShoppingEventListeners() {
        const addItemBtn = document.getElementById('add-shopping-item');
        if (addItemBtn) {
            addItemBtn.removeEventListener('click', this.handleAddShoppingItem);
            addItemBtn.addEventListener('click', this.handleAddShoppingItem.bind(this));
        }
    }

    /**
     * Handle adding new shopping item
     */
    async handleAddShoppingItem() {
        const name = prompt('Item name:');
        if (!name || !name.trim()) return;

        const quantity = prompt('Quantity:', '1');
        if (!quantity || isNaN(quantity) || quantity < 1) return;

        const category = prompt('Category (shelter, cooking, water, comfort, other):', 'other');
        const notes = prompt('Notes (optional):') || '';

        try {
            const itemData = {
                name: name.trim(),
                quantity: parseInt(quantity),
                category: category.toLowerCase() || 'other',
                notes: notes.trim()
            };

            const response = await this.apiService.addShoppingItem(this.tripId, itemData);
            
            // Add to local data
            this.shoppingItems.push(response.data);
            
            // Re-render shopping tab
            this.renderTabContent();
            
            console.log('Shopping item added successfully');
            
        } catch (error) {
            console.error('Error adding shopping item:', error);
            alert('Failed to add item. Please try again.');
        }
    }

    /**
     * Toggle purchased status of shopping item
     */
    async togglePurchased(itemId) {
        try {
            const item = this.shoppingItems.find(i => i.id === itemId);
            if (!item) return;

            await this.apiService.updateShoppingItem(itemId, { 
                purchased: !item.purchased 
            });
            
            // Update local data
            item.purchased = !item.purchased;
            
            // Re-render shopping tab
            this.renderTabContent();
            
        } catch (error) {
            console.error('Error updating shopping item:', error);
            alert('Failed to update item');
        }
    }

    /**
     * Edit shopping item
     */
    editShoppingItem(itemId) {
        const item = this.shoppingItems.find(i => i.id === itemId);
        if (!item) return;

        const newName = prompt('Item name:', item.name);
        if (newName && newName !== item.name) {
            this.updateShoppingItem(itemId, { name: newName });
        }
    }

    /**
     * Delete shopping item
     */
    async deleteShoppingItem(itemId) {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            await this.apiService.deleteShoppingItem(itemId);
            
            // Remove from local data
            this.shoppingItems = this.shoppingItems.filter(i => i.id !== itemId);
            
            // Re-render shopping tab
            this.renderTabContent();
            
        } catch (error) {
            console.error('Error deleting shopping item:', error);
            alert('Failed to delete item');
        }
    }

    /**
     * Update shopping item
     */
    async updateShoppingItem(itemId, updates) {
        try {
            await this.apiService.updateShoppingItem(itemId, updates);
            
            // Update local data
            const item = this.shoppingItems.find(i => i.id === itemId);
            if (item) {
                Object.assign(item, updates);
            }
            
            // Re-render shopping tab
            this.renderTabContent();
            
        } catch (error) {
            console.error('Error updating shopping item:', error);
            alert('Failed to update item');
        }
    }
}

// Make trip page globally accessible for shopping list interactions
window.tripPage = null;
