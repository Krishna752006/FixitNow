import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ArrowLeft, Clock, CheckCircle, XCircle, Wrench, CheckCheck, FileText, Clock3 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import StatusTimeline from './StatusTimeline';
import Invoice from './Invoice';
import JobStatusActions from './JobStatusActions';

const statusIcons = {
  pending: <Clock className="w-5 h-5 text-yellow-500" />,
  accepted: <CheckCircle className="w-5 h-5 text-blue-500" />,
  in_progress: <Wrench className="w-5 h-5 text-indigo-500" />,
  completed: <CheckCheck className="w-5 h-5 text-green-500" />,
  cancelled: <XCircle className="w-5 h-5 text-red-500" />,
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function JobDetails() {
  const { jobId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/jobs/${jobId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch job details');
        }
        const data = await response.json();
        setJob(data);
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

      const updatedJob = await response.json();
      setJob(updatedJob);
      return updatedJob;
    } catch (error) {
      console.error('Error updating status:', error);
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
        invoice: { ...prev.invoice, ...invoice }
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error || 'Job not found'}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {job.title || `${job.category} Service`}
          </h1>
          <div className="flex items-center mt-1 space-x-2">
            <Badge className={statusColors[job.status]}>
              {statusIcons[job.status]}
              <span className="ml-1 capitalize">{job.status.replace('_', ' ')}</span>
            </Badge>
            <span className="text-sm text-gray-500">
              #{job._id.slice(-6).toUpperCase()}
            </span>
          </div>
        </div>
        <JobStatusActions 
          job={job} 
          onStatusUpdate={handleStatusUpdate} 
          userRole={user.role}
        />
      </div>

      <Tabs 
        defaultValue="details" 
        className="w-full"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">
            <FileText className="w-4 h-4 mr-2" />
            Details
          </TabsTrigger>
          <TabsTrigger value="status">
            <Clock3 className="w-4 h-4 mr-2" />
            Status
          </TabsTrigger>
          <TabsTrigger value="invoice">
            <FileText className="w-4 h-4 mr-2" />
            Invoice
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Category</h3>
                  <p className="mt-1">{job.category}</p>
                </div>
                {job.description && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Description</h3>
                    <p className="mt-1 whitespace-pre-line">{job.description}</p>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Priority</h3>
                  <p className="mt-1 capitalize">{job.priority}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Scheduled</h3>
                  <p className="mt-1">
                    {format(new Date(job.scheduledDate), 'MMMM d, yyyy')} at {job.scheduledTime}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{job.location?.address}</p>
                  <p className="text-gray-600">
                    {job.location?.city}, {job.location?.state} {job.location?.zipCode}
                  </p>
                  {job.location?.specialInstructions && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="text-sm font-medium text-gray-500">Special Instructions</h4>
                      <p className="mt-1 text-sm text-gray-600">{job.location.specialInstructions}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {job.professional && (
                <Card>
                  <CardHeader>
                    <CardTitle>Professional</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-xl font-medium text-gray-600">
                        {job.professional?.name?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <p className="font-medium">{job.professional?.name || 'Professional'}</p>
                        <p className="text-sm text-gray-500">{job.professional?.profession || 'Service Provider'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="status" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Status History</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusTimeline statusHistory={job.statusHistory || []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoice" className="mt-6">
          {job.status === 'completed' ? (
            <Invoice 
              invoice={job.invoice} 
              jobId={job._id}
              onGenerateInvoice={handleGenerateInvoice}
            />
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No invoice available</h3>
              <p className="mt-1 text-sm text-gray-500">
                Invoice will be available once the job is completed.
              </p>
              {user.role === 'admin' && (
                <Button 
                  className="mt-4"
                  onClick={handleGenerateInvoice}
                >
                  Generate Invoice
                </Button>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
