// Trip storage utility for managing trips in localStorage
export const TripStorage = {
  getAllTrips() {
    return JSON.parse(localStorage.getItem('gotogether_trips') || '[]');
  },

  saveTrip(trip) {
    const trips = this.getAllTrips();
    const existingIndex = trips.findIndex(t => t.id === trip.id);
    
    if (existingIndex >= 0) {
      trips[existingIndex] = trip;
    } else {
      trips.push(trip);
    }
    
    localStorage.setItem('gotogether_trips', JSON.stringify(trips));
    return trip;
  },

  createTrip(tripData) {
    const trip = {
      id: Date.now(),
      name: tripData.name,
      description: tripData.description || '',
      location: tripData.location || '',
      startDate: tripData.startDate,
      endDate: tripData.endDate,
      createdBy: tripData.createdBy,
      members: tripData.members || [tripData.createdBy],
      inviteCode: this.generateInviteCode(),
      status: 'planning', // planning, active, completed, cancelled
      activities: [],
      shoppingList: [],
      notes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return this.saveTrip(trip);
  },

  getUserTrips(userId) {
    const allTrips = this.getAllTrips();
    return allTrips.filter(trip => 
      trip.members.includes(userId) || trip.createdBy === userId
    );
  },

  getTripById(tripId) {
    const trips = this.getAllTrips();
    return trips.find(trip => trip.id === tripId);
  },

  getTripByInviteCode(inviteCode) {
    const trips = this.getAllTrips();
    return trips.find(trip => trip.inviteCode === inviteCode);
  },

  joinTrip(tripId, userId) {
    const trip = this.getTripById(tripId);
    if (trip && !trip.members.includes(userId)) {
      trip.members.push(userId);
      trip.updatedAt = new Date().toISOString();
      return this.saveTrip(trip);
    }
    return trip;
  },

  addActivity(tripId, activity) {
    const trip = this.getTripById(tripId);
    if (trip) {
      const newActivity = {
        id: Date.now(),
        ...activity,
        createdAt: new Date().toISOString()
      };
      trip.activities.push(newActivity);
      trip.updatedAt = new Date().toISOString();
      return this.saveTrip(trip);
    }
    return null;
  },

  deleteActivity(tripId, activityId) {
    const trip = this.getTripById(tripId);
    if (trip && trip.activities) {
      const initialLength = trip.activities.length;
      trip.activities = trip.activities.filter(activity => 
        (activity.id || trip.activities.indexOf(activity)) !== activityId
      );
      
      if (trip.activities.length < initialLength) {
        trip.updatedAt = new Date().toISOString();
        return this.saveTrip(trip);
      }
    }
    return null;
  },

  addShoppingItem(tripId, item) {
    const trip = this.getTripById(tripId);
    if (trip) {
      const newItem = {
        id: Date.now(),
        name: item.name,
        quantity: item.quantity || 1,
        assignedTo: item.assignedTo || null,
        completed: false,
        createdAt: new Date().toISOString()
      };
      trip.shoppingList.push(newItem);
      trip.updatedAt = new Date().toISOString();
      return this.saveTrip(trip);
    }
    return null;
  },

  generateInviteCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
};
