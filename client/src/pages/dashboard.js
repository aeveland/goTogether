/**
 * Dashboard Page Component
 * Main landing page showing user's trips and quick actions
 */
import { ApiService } from '../utils/api.js';
import { AuthService } from '../utils/auth.js';

export class DashboardPage {
    constructor(props = {}) {
        this.props = props;
        this.apiService = new ApiService();
        this.authService = new AuthService();
        this.trips = [];
        this.isLoading = true;
        
        // Bind methods
        this.handleLogout = this.handleLogout.bind(this);
        this.handleCreateTrip = this.handleCreateTrip.bind(this);
    }

    /**
     * Render the dashboard page
     * @returns {HTMLElement} - The rendered page element
     */
    render() {
        const container = document.createElement('div');
        container.className = 'fade-in';
        
        container.innerHTML = `
            <!-- App Bar -->
            <div class="app-bar">
                <h1 class="app-bar-title">Go Together</h1>
                <div class="app-bar-actions">
                    <button class="mdc-button" id="profile-btn">
                        <span class="mdc-button__ripple"></span>
                        <i class="material-icons mdc-button__icon">account_circle</i>
                        <span class="mdc-button__label">Profile</span>
                    </button>
                    <button class="mdc-button" id="logout-btn">
                        <span class="mdc-button__ripple"></span>
                        <i class="material-icons mdc-button__icon">logout</i>
                        <span class="mdc-button__label">Logout</span>
                    </button>
                </div>
            </div>

            <div class="page-container">
                <div class="page-header">
                    <h2 class="page-title">Your Trips</h2>
                    <p class="page-subtitle">Plan and manage your group adventures</p>
                </div>

                <!-- Quick Actions -->
                <div class="mb-4">
                    <button class="mdc-button mdc-button--raised" id="create-trip-btn">
                        <span class="mdc-button__ripple"></span>
                        <i class="material-icons mdc-button__icon">add</i>
                        <span class="mdc-button__label">Create New Trip</span>
                    </button>
                </div>

                <!-- Loading State -->
                <div id="loading-state" class="text-center p-4">
                    <div class="mdc-circular-progress" style="width:48px;height:48px;" role="progressbar">
                        <div class="mdc-circular-progress__determinate-container">
                            <svg class="mdc-circular-progress__determinate-circle-graphic" viewBox="0 0 48 48">
                                <circle class="mdc-circular-progress__determinate-track" cx="24" cy="24" r="18" stroke-width="4"/>
                                <circle class="mdc-circular-progress__determinate-circle" cx="24" cy="24" r="18" stroke-dasharray="113.097" stroke-dashoffset="113.097" stroke-width="4"/>
                            </svg>
                        </div>
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
                    <p class="mt-2">Loading your trips...</p>
                </div>

                <!-- Trips Grid -->
                <div id="trips-container" class="d-none">
                    <div id="trips-grid" class="card-grid"></div>
                </div>

                <!-- Empty State -->
                <div id="empty-state" class="d-none text-center p-4">
                    <i class="material-icons" style="font-size: 64px; color: #ccc;">explore</i>
                    <h3 class="mdc-typography--headline6 mt-3">No trips yet</h3>
                    <p class="mdc-typography--body1">Create your first trip to start planning your next adventure!</p>
                    <button class="mdc-button mdc-button--raised mt-3" id="create-first-trip-btn">
                        <span class="mdc-button__ripple"></span>
                        <i class="material-icons mdc-button__icon">add</i>
                        <span class="mdc-button__label">Create Your First Trip</span>
                    </button>
                </div>
            </div>
        `;

        // Add event listeners
        this.attachEventListeners(container);
        
        // Load trips data
        this.loadTrips();

        return container;
    }

    /**
     * Attach event listeners
     * @param {HTMLElement} container - The container element
     */
    attachEventListeners(container) {
        const logoutBtn = container.querySelector('#logout-btn');
        const profileBtn = container.querySelector('#profile-btn');
        const createTripBtn = container.querySelector('#create-trip-btn');
        const createFirstTripBtn = container.querySelector('#create-first-trip-btn');

        logoutBtn?.addEventListener('click', this.handleLogout);
        profileBtn?.addEventListener('click', () => window.location.href = '/profile');
        createTripBtn?.addEventListener('click', this.handleCreateTrip);
        createFirstTripBtn?.addEventListener('click', this.handleCreateTrip);
    }

    /**
     * Load trips from API
     */
    async loadTrips() {
        try {
            const response = await this.apiService.getTrips();
            // Handle both mock API format {data: [...]} and direct array format
            this.trips = response.data || response;
            console.log('Loaded trips:', this.trips);
            this.renderTrips();
        } catch (error) {
            console.error('Failed to load trips:', error);
            this.showError('Failed to load trips. Please try again.');
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    /**
     * Render trips in the grid
     */
    renderTrips() {
        const tripsContainer = document.getElementById('trips-container');
        const emptyState = document.getElementById('empty-state');
        const tripsGrid = document.getElementById('trips-grid');

        if (this.trips.length === 0) {
            tripsContainer?.classList.add('d-none');
            emptyState?.classList.remove('d-none');
        } else {
            emptyState?.classList.add('d-none');
            tripsContainer?.classList.remove('d-none');
            
            if (tripsGrid) {
                tripsGrid.innerHTML = this.trips.map(trip => this.renderTripCard(trip)).join('');
            }
        }
    }

    /**
     * Render a single trip card
     * @param {object} trip - Trip data
     * @returns {string} - HTML string for trip card
     */
    renderTripCard(trip) {
        const startDate = new Date(trip.start_date);
        const endDate = new Date(trip.end_date);
        const now = new Date();
        
        let status = 'upcoming';
        if (now >= startDate && now <= endDate) {
            status = 'live';
        } else if (now > endDate) {
            status = 'completed';
        }

        return `
            <div class="mdc-card trip-card" data-trip-id="${trip.id}">
                <div class="mdc-card__primary-action" data-route="/trip/${trip.id}">
                    <div class="mdc-card__media" style="background-image: url('https://source.unsplash.com/400x200/?camping,nature'); height: 200px;">
                        <div class="mdc-card__media-content">
                            <span class="status-chip ${status}">${status}</span>
                        </div>
                    </div>
                    <div class="mdc-card__content">
                        <h3 class="mdc-typography--headline6">${trip.name}</h3>
                        <p class="mdc-typography--body2">${trip.location}</p>
                        <p class="mdc-typography--caption">
                            ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}
                        </p>
                        <p class="mdc-typography--caption">
                            ${trip.member_count || 0} members
                        </p>
                    </div>
                </div>
                <div class="mdc-card__actions">
                    <button class="mdc-button mdc-card__action mdc-card__action--button" data-route="/trip/${trip.id}">
                        <span class="mdc-button__ripple"></span>
                        <span class="mdc-button__label">View Trip</span>
                    </button>
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
        // TODO: Implement proper error display
        alert(message);
    }

    /**
     * Handle logout
     */
    handleLogout() {
        if (confirm('Are you sure you want to log out?')) {
            this.authService.logout();
        }
    }

    /**
     * Handle create trip
     */
    handleCreateTrip() {
        // TODO: Implement create trip modal/page
        alert('Create trip functionality coming soon!');
    }
}
