import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ArrowLeft, MapPin, Calendar, User, DollarSign, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import JobTrackingTimeline from './JobTrackingTimeline';
import JobStatusActions from './JobStatusActions';
import Invoice from './Invoice';
import StatusTimeline from './StatusTimeline';

export default function JobDetailsPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/jobs/${jobId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch job details');
        }
        const data = await response.json();
        // Handle both response formats
        const jobData = data.data?.job || data.job || data;
        setJob(jobData);
      } catch (err) {
        console.error('Error fetching job:', err);
        setError(err.message);
        toast({
          title: 'Error',
          description: 'Failed to load job details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId, toast]);

  const handleStatusUpdate = async (status, notes = '') => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, notes }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Refetch the job to get updated data
      const jobResponse = await fetch(`/api/jobs/${jobId}`);
      const jobData = await jobResponse.json();
      const updatedJob = jobData.data?.job || jobData.job || jobData;
      setJob(updatedJob);
      toast({
        title: 'Success',
        description: 'Job status updated successfully',
      });
      return updatedJob;
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update status',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleGenerateInvoice = async () => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/generate-invoice`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to generate invoice');
      }

      const { invoice } = await response.json();
      setJob(prev => ({
        ...prev,
        invoice
      }));
      
      toast({
        title: 'Success',
        description: 'Invoice generated successfully',
      });
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate invoice',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Job not found'}</p>
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            {job.title || `${job.category} Service`}
          </h1>
          <p className="text-gray-600 mt-1">Job ID: #{job._id.slice(-6).toUpperCase()}</p>
        </div>
        <JobStatusActions 
          job={job} 
          onStatusUpdate={handleStatusUpdate} 
          userRole={user.role}
        />
      </div>

      {/* Job Tracking Timeline */}
      <div className="mb-8">
        <JobTrackingTimeline 
          currentStatus={job.status} 
          statusHistory={job.statusHistory || []}
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="invoice">Invoice</TabsTrigger>
          <TabsTrigger value="professional">Professional</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Job Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Job Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Category</label>
                  <p className="text-gray-900 font-medium">{job.category}</p>
                </div>
                {job.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Description</label>
                    <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-600">Priority</label>
                  <Badge className="mt-1 capitalize">{job.priority}</Badge>
                </div>
                {job.price && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Price</label>
                    <p className="text-gray-900 font-medium flex items-center space-x-1">
                      <DollarSign className="w-4 h-4" />
                      <span>₹{job.price.toFixed(2)}</span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Location & Schedule */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5" />
                    <span>Location</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium text-gray-900">{job.location?.address}</p>
                  <p className="text-gray-600 text-sm mt-1">
                    {job.location?.city}, {job.location?.state} {job.location?.zipCode}
                  </p>
                  {job.location?.specialInstructions && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-600">Special Instructions</h4>
                      <p className="text-sm text-gray-700 mt-2">{job.location.specialInstructions}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Schedule</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-900 font-medium">
                    {format(new Date(job.scheduledDate), 'EEEE, MMMM d, yyyy')}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">at {job.scheduledTime}</p>
                  {job.estimatedDuration && (
                    <p className="text-gray-600 text-sm mt-2">
                      Estimated Duration: {job.estimatedDuration} hours
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Status History</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusTimeline statusHistory={job.statusHistory || []} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoice Tab */}
        <TabsContent value="invoice" className="mt-6">
          {job.status === 'completed' ? (
            <Invoice 
              invoice={job.invoice} 
              jobId={job._id}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No Invoice Available</h3>
                <p className="text-gray-600 mt-2">
                  Invoice will be generated once the job is completed.
                </p>
                {user.role === 'admin' && job.status === 'completed' && (
                  <Button 
                    className="mt-4"
                    onClick={handleGenerateInvoice}
                  >
                    Generate Invoice
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Professional Tab */}
        <TabsContent value="professional" className="mt-6">
          {job.professional ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Assigned Professional</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-white">
                    {job.professional?.name?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      {job.professional?.name || 'Professional'}
                    </p>
                    <p className="text-gray-600">
                      {job.professional?.profession || 'Service Provider'}
                    </p>
                    {job.professional?.rating && (
                      <p className="text-sm text-yellow-600 mt-1">
                        ⭐ {job.professional.rating} / 5
                      </p>
                    )}
                  </div>
                </div>
                {job.professional?.phone && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600">Contact</p>
                    <p className="text-gray-900 font-medium mt-1">{job.professional.phone}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No Professional Assigned</h3>
                <p className="text-gray-600 mt-2">
                  A professional will be assigned once you accept a job request.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
