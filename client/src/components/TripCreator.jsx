import React, { useState } from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Button, 
  Input, 
  Textarea,
  DatePicker,
  Spacer
} from '@heroui/react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

function TripCreator({ user, onCreateTrip, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Trip name is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onCreateTrip({
        name: formData.name.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate
      });
    } catch (error) {
      console.error('Error creating trip:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            isIconOnly
            variant="light"
            onPress={onCancel}
            className="text-gray-600"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Trip</h1>
            <p className="text-gray-600">Plan your next adventure</p>
          </div>
        </div>

        {/* Trip Creation Form */}
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">🏕️</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold">Trip Details</h2>
                <p className="text-sm text-gray-600">Tell us about your trip</p>
              </div>
            </div>
          </CardHeader>
          
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Trip Name"
                placeholder="e.g., Yosemite Weekend Adventure"
                value={formData.name}
                onValueChange={(value) => handleInputChange('name', value)}
                isRequired
                variant="bordered"
                errorMessage={errors.name}
                isInvalid={!!errors.name}
                description="Give your trip a memorable name"
              />

              <Input
                label="Location"
                placeholder="e.g., Yosemite National Park, CA"
                value={formData.location}
                onValueChange={(value) => handleInputChange('location', value)}
                isRequired
                variant="bordered"
                errorMessage={errors.location}
                isInvalid={!!errors.location}
                description="Where are you going?"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  value={formData.startDate}
                  onValueChange={(value) => handleInputChange('startDate', value)}
                  isRequired
                  variant="bordered"
                  errorMessage={errors.startDate}
                  isInvalid={!!errors.startDate}
                />

                <Input
                  label="End Date"
                  type="date"
                  value={formData.endDate}
                  onValueChange={(value) => handleInputChange('endDate', value)}
                  isRequired
                  variant="bordered"
                  errorMessage={errors.endDate}
                  isInvalid={!!errors.endDate}
                />
              </div>

              <Textarea
                label="Description (Optional)"
                placeholder="Tell your group what to expect on this trip..."
                value={formData.description}
                onValueChange={(value) => handleInputChange('description', value)}
                variant="bordered"
                minRows={3}
                description="Share details about activities, what to bring, or anything else"
              />

              <Spacer y={4} />

              <div className="flex gap-3 justify-end">
                <Button
                  variant="light"
                  onPress={onCancel}
                  isDisabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  isLoading={loading}
                  className="bg-gradient-to-r from-blue-500 to-purple-600"
                >
                  {loading ? 'Creating Trip...' : 'Create Trip'}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        {/* Tips Card */}
        <Card className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
          <CardBody className="p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Pro Tips</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Choose a descriptive name that gets everyone excited</li>
                  <li>• Include specific location details for easy navigation</li>
                  <li>• Add buffer time for travel and setup</li>
                  <li>• You can always edit these details later</li>
                </ul>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default TripCreator;
