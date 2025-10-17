import React, { useState } from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Button, 
  Chip,
  Tabs,
  Tab,
  Avatar,
  AvatarGroup,
  Input,
  Textarea,
  Checkbox,
  Divider
} from '@heroui/react';
import { 
  ArrowLeftIcon, 
  MapPinIcon, 
  CalendarIcon,
  UserGroupIcon,
  ShareIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

function TripDetails({ trip, user, onBack }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [newActivity, setNewActivity] = useState('');
  const [newShoppingItem, setNewShoppingItem] = useState('');

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDuration = () => {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleShareTrip = () => {
    navigator.clipboard.writeText(`Join my trip "${trip.name}" with code: ${trip.inviteCode}`);
    // You could add a toast notification here
    alert('Invite code copied to clipboard!');
  };

  const handleAddActivity = () => {
    if (newActivity.trim()) {
      // In a real app, this would call TripStorage.addActivity
      console.log('Adding activity:', newActivity);
      setNewActivity('');
    }
  };

  const handleAddShoppingItem = () => {
    if (newShoppingItem.trim()) {
      // In a real app, this would call TripStorage.addShoppingItem
      console.log('Adding shopping item:', newShoppingItem);
      setNewShoppingItem('');
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              isIconOnly
              variant="light"
              onPress={onBack}
              className="text-gray-600"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{trip.name}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                <div className="flex items-center gap-1">
                  <MapPinIcon className="w-4 h-4" />
                  {trip.location}
                </div>
                <div className="flex items-center gap-1">
                  <CalendarIcon className="w-4 h-4" />
                  {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                </div>
                <div className="flex items-center gap-1">
                  <UserGroupIcon className="w-4 h-4" />
                  {trip.members.length} member{trip.members.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Chip 
              color={trip.status === 'planning' ? 'warning' : 'success'} 
              variant="flat"
              size="sm"
            >
              {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
            </Chip>
            <Button
              color="primary"
              variant="light"
              startContent={<ShareIcon className="w-4 h-4" />}
              onPress={handleShareTrip}
            >
              Share
            </Button>
          </div>
        </div>

        {/* Trip Overview Card */}
        <Card className="mb-6 shadow-lg">
          <CardBody className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{getDuration()}</div>
                <div className="text-sm text-gray-600">Days</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{trip.activities?.length || 0}</div>
                <div className="text-sm text-gray-600">Activities</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{trip.shoppingList?.length || 0}</div>
                <div className="text-sm text-gray-600">Items to Pack</div>
              </div>
            </div>
            
            {trip.description && (
              <>
                <Divider className="my-4" />
                <div>
                  <h3 className="font-semibold mb-2">About this trip</h3>
                  <p className="text-gray-700">{trip.description}</p>
                </div>
              </>
            )}
          </CardBody>
        </Card>

        {/* Tabs */}
        <Card className="shadow-lg">
          <CardBody className="p-0">
            <Tabs 
              selectedKey={activeTab} 
              onSelectionChange={setActiveTab}
              className="w-full"
              classNames={{
                tabList: "w-full relative rounded-none p-0 border-b border-divider",
                cursor: "w-full bg-primary",
                tab: "max-w-fit px-6 h-12",
                tabContent: "group-data-[selected=true]:text-primary"
              }}
            >
              <Tab key="overview" title="Overview">
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Members */}
                    <div>
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <UserGroupIcon className="w-5 h-5" />
                        Trip Members
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Avatar 
                              name={user.name} 
                              size="sm"
                              className="bg-blue-500 text-white"
                            />
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-xs text-gray-500">Trip Organizer</div>
                            </div>
                          </div>
                          <Chip size="sm" color="primary" variant="flat">You</Chip>
                        </div>
                        
                        {trip.members.length > 1 && (
                          <div className="text-center py-4 text-gray-500">
                            <UserGroupIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Other members will appear here when they join</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-blue-900 mb-2">Invite Others</h4>
                        <p className="text-sm text-blue-700 mb-3">Share this code with friends:</p>
                        <div className="flex items-center gap-2">
                          <code className="bg-white px-3 py-2 rounded border text-lg font-mono font-bold text-blue-600">
                            {trip.inviteCode}
                          </code>
                          <Button size="sm" variant="light" onPress={handleShareTrip}>
                            Copy
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div>
                      <h3 className="font-semibold mb-4">Trip Details</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-600">Created</span>
                          <span className="font-medium">{formatDate(trip.createdAt)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-600">Duration</span>
                          <span className="font-medium">{getDuration()} days</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-600">Status</span>
                          <Chip 
                            color={trip.status === 'planning' ? 'warning' : 'success'} 
                            size="sm"
                            variant="flat"
                          >
                            {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                          </Chip>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Tab>

              <Tab key="activities" title="Activities">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Planned Activities</h3>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Add an activity..."
                        value={newActivity}
                        onValueChange={setNewActivity}
                        size="sm"
                        className="w-64"
                      />
                      <Button
                        color="primary"
                        size="sm"
                        isIconOnly
                        onPress={handleAddActivity}
                      >
                        <PlusIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {trip.activities?.length > 0 ? (
                    <div className="space-y-2">
                      {trip.activities.map((activity, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          {activity.name}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <div className="text-4xl mb-4">🎯</div>
                      <p>No activities planned yet</p>
                      <p className="text-sm">Add some activities to make your trip more exciting!</p>
                    </div>
                  )}
                </div>
              </Tab>

              <Tab key="packing" title="Packing List">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Packing List</h3>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Add an item..."
                        value={newShoppingItem}
                        onValueChange={setNewShoppingItem}
                        size="sm"
                        className="w-64"
                      />
                      <Button
                        color="primary"
                        size="sm"
                        isIconOnly
                        onPress={handleAddShoppingItem}
                      >
                        <PlusIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {trip.shoppingList?.length > 0 ? (
                    <div className="space-y-2">
                      {trip.shoppingList.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Checkbox size="sm" />
                          <span>{item.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <div className="text-4xl mb-4">🎒</div>
                      <p>No items in packing list yet</p>
                      <p className="text-sm">Add items that everyone should bring!</p>
                    </div>
                  )}
                </div>
              </Tab>
            </Tabs>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default TripDetails;
