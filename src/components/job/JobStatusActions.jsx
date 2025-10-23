import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, CheckCircle, Clock, XCircle, Wrench, CheckCheck } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const statusOptions = [
  { value: 'pending', label: 'Mark as Pending', icon: <Clock className="w-4 h-4 mr-2" /> },
  { value: 'accepted', label: 'Accept Job', icon: <CheckCircle className="w-4 h-4 mr-2 text-blue-500" /> },
  { value: 'in_progress', label: 'Start Work', icon: <Wrench className="w-4 h-4 mr-2 text-indigo-500" /> },
  { value: 'completed', label: 'Mark as Completed', icon: <CheckCheck className="w-4 h-4 mr-2 text-green-500" /> },
  { value: 'cancelled', label: 'Cancel Job', icon: <XCircle className="w-4 h-4 mr-2 text-red-500" /> },
];

export default function JobStatusActions({ job, onStatusUpdate, userRole }) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Filter out invalid status transitions based on current status and user role
  const getValidStatusOptions = () => {
    const currentStatus = job?.status;
    
    // Admin can change to any status
    if (userRole === 'admin') return statusOptions;
    
    // Professional can only update to certain statuses
    if (userRole === 'professional') {
      return statusOptions.filter(option => {
        if (currentStatus === 'pending') {
          return ['accepted', 'cancelled'].includes(option.value);
        }
        if (currentStatus === 'accepted') {
          return ['in_progress', 'cancelled'].includes(option.value);
        }
        if (currentStatus === 'in_progress') {
          return ['completed', 'cancelled'].includes(option.value);
        }
        return false;
      });
    }
    
    // User can only cancel pending or accepted jobs
    if (userRole === 'user') {
      if (['pending', 'accepted'].includes(currentStatus)) {
        return statusOptions.filter(option => option.value === 'cancelled');
      }
    }
    
    return [];
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    setIsDialogOpen(true);
  };

  const confirmStatusUpdate = async () => {
    if (!selectedStatus) return;
    
    setIsUpdating(true);
    try {
      await onStatusUpdate(selectedStatus, notes);
      toast({
        title: 'Status updated',
        description: `Job status has been updated to ${selectedStatus.replace('_', ' ')}.`,
      });
      setIsDialogOpen(false);
      setNotes('');
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update status',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const validStatusOptions = getValidStatusOptions();
  
  if (validStatusOptions.length === 0) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreVertical className="w-4 h-4" />
            <span className="sr-only">Change status</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {validStatusOptions.map((option) => (
            <DropdownMenuItem 
              key={option.value} 
              onClick={() => handleStatusChange(option.value)}
              className="cursor-pointer"
            >
              {option.icon}
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Job Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p>
              Are you sure you want to update this job's status to{' '}
              <span className="font-semibold">
                {selectedStatus?.replace('_', ' ')}
              </span>?
            </p>
            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">
                Add a note (optional):
              </label>
              <Textarea
                id="notes"
                placeholder="Add any additional information..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDialogOpen(false);
                setNotes('');
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmStatusUpdate}
              disabled={isUpdating}
            >
              {isUpdating ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
