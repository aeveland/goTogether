import React, { useState } from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Button, 
  Avatar, 
  Chip,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from '@heroui/react';
import { 
  PlusIcon, 
  UserGroupIcon, 
  MapPinIcon,
  CalendarIcon 
} from '@heroicons/react/24/outline';
import { TripStorage } from '../utils/tripStorage';

function Dashboard({ user, trips, onLogout, onCreateTrip, onViewTrip }) {
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const {isOpen, onOpen, onClose} = useDisclosure();

  const handleJoinTrip = () => {
    if (!joinCode.trim()) {
      setJoinError('Please enter an invite code');
      return;
    }

    const trip = TripStorage.getTripByInviteCode(joinCode.trim().toUpperCase());
    if (trip) {
      if (trip.members.includes(user.id)) {
        setJoinError('You are already a member of this trip');
        return;
      }
      
      TripStorage.joinTrip(trip.id, user.id);
      onViewTrip(trip);
      onClose();
      setJoinCode('');
      setJoinError('');
    } else {
      setJoinError('Invalid invite code. Please check and try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <div className="min-h-screen p-4">
        {/* Header */}
        <Card className="mb-6 shadow-lg">
          <CardBody className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Avatar
                  name={user.name}
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                />
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Go Together</h1>
                  <p className="text-gray-600">Welcome back, {user.name}!</p>
                </div>
              </div>
              <Button
                color="danger"
                variant="light"
                onPress={onLogout}
              >
                Logout
              </Button>
            </div>
          </CardBody>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Quick Actions */}
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <h2 className="text-xl font-semibold text-gray-800">Quick Actions</h2>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="space-y-3">
                <Button
                  color="success"
                  size="lg"
                  className="w-full justify-start bg-gradient-to-r from-green-500 to-emerald-600"
                  startContent={<PlusIcon className="w-5 h-5" />}
                  onPress={onCreateTrip}
                >
                  Create New Trip
                </Button>
                <Button
                  color="primary"
                  size="lg"
                  className="w-full justify-start bg-gradient-to-r from-blue-500 to-purple-600"
                  startContent={<UserGroupIcon className="w-5 h-5" />}
                  onPress={onOpen}
                >
                  Join Existing Trip
                </Button>
                <Button
                  color="secondary"
                  size="lg"
                  className="w-full justify-start"
                  startContent={<span className="text-lg">🔍</span>}
                  variant="bordered"
                  isDisabled
                >
                  Browse Public Trips (Coming Soon)
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Recent Activity */}
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">📋</div>
                <p className="font-medium">No recent activity yet</p>
                <p className="text-sm">Create your first trip to get started!</p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Your Trips */}
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center w-full">
              <h2 className="text-xl font-semibold text-gray-800">Your Trips</h2>
              <Chip color="primary" variant="flat" size="sm">
                {trips.length} {trips.length === 1 ? 'trip' : 'trips'}
              </Chip>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            {trips.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-6">🎒</div>
                <h3 className="text-lg font-medium mb-2">No trips yet</h3>
                <p className="text-sm mb-6">Create your first trip to start planning your adventure!</p>
                <Button
                  color="primary"
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-600"
                  startContent={<PlusIcon className="w-5 h-5" />}
                  onPress={onCreateTrip}
                >
                  Create Your First Trip
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trips.map((trip) => (
                  <Card 
                    key={trip.id} 
                    className="border border-gray-200 hover:shadow-lg transition-all cursor-pointer hover:scale-105"
                    isPressable
                    onPress={() => onViewTrip(trip)}
                  >
                    <CardBody className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-gray-800 text-lg">{trip.name}</h3>
                        <Chip 
                          size="sm" 
                          color={trip.status === 'planning' ? 'warning' : 'success'}
                          variant="flat"
                        >
                          {trip.status}
                        </Chip>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPinIcon className="w-4 h-4" />
                          <span>{trip.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CalendarIcon className="w-4 h-4" />
                          <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <UserGroupIcon className="w-4 h-4" />
                          <span>{trip.members.length} member{trip.members.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      
                      {trip.description && (
                        <p className="text-gray-600 text-sm line-clamp-2">{trip.description}</p>
                      )}
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Join Trip Modal */}
      <Modal isOpen={isOpen} onClose={onClose} placement="center">
        <ModalContent>
          <ModalHeader>Join a Trip</ModalHeader>
          <ModalBody>
            <p className="text-gray-600 mb-4">
              Enter the invite code shared by your trip organizer to join their trip.
            </p>
            <Input
              label="Invite Code"
              placeholder="e.g., ABC123"
              value={joinCode}
              onValueChange={(value) => {
                setJoinCode(value.toUpperCase());
                setJoinError('');
              }}
              isInvalid={!!joinError}
              errorMessage={joinError}
              variant="bordered"
              description="Invite codes are 6 characters long"
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button 
              color="primary" 
              onPress={handleJoinTrip}
              isDisabled={!joinCode.trim()}
            >
              Join Trip
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default Dashboard;
