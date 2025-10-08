import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, Edit, Trash2, Clock, MapPin, User, Phone, AlertCircle, Check, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useForm } from 'react-hook-form';

interface VendorEvent {
  id: number;
  title: string;
  description?: string;
  location?: string;
  start_datetime: string;
  end_datetime: string;
  all_day: boolean;
  event_type: 'booking' | 'blocked' | 'personal' | 'consultation' | 'shoot' | 'wedding' | 'engagement' | 'corporate' | 'birthday' | 'anniversary';
  status: 'tentative' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  client_name?: string;
  client_phone?: string;
  client_email?: string;
  color: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface VendorCalendarProps {
  vendorId: number;
  events: VendorEvent[];
  onEventCreate: (event: Partial<VendorEvent>) => Promise<void>;
  onEventUpdate: (id: number, event: Partial<VendorEvent>) => Promise<void>;
  onEventDelete: (id: number) => Promise<void>;
  onEventsRefresh: () => Promise<void>;
}

type CalendarView = 'month' | 'week' | 'list';

type EventFormData = {
  title: string;
  description?: string;
  location?: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  all_day: boolean;
  event_type: string;
  status: string;
  client_name?: string;
  client_phone?: string;
  client_email?: string;
  color: string;
  priority: string;
};

const VendorCalendar: React.FC<VendorCalendarProps> = ({
  vendorId,
  events,
  onEventCreate,
  onEventUpdate,
  onEventDelete,
  onEventsRefresh
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [selectedEvent, setSelectedEvent] = useState<VendorEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<EventFormData>();

  const eventTypeColors = {
    booking: '#3B82F6',
    blocked: '#EF4444',
    personal: '#8B5CF6',
    consultation: '#F59E0B',
    shoot: '#10B981',
    wedding: '#EC4899',
    engagement: '#F97316',
    corporate: '#6366F1',
    birthday: '#14B8A6',
    anniversary: '#84CC16'
  };

  const eventTypeLabels = {
    booking: 'General Booking',
    blocked: 'Blocked/Unavailable',
    personal: 'Personal',
    consultation: 'Consultation',
    shoot: 'Photo Shoot',
    wedding: 'Wedding',
    engagement: 'Engagement',
    corporate: 'Corporate Event',
    birthday: 'Birthday Party',
    anniversary: 'Anniversary'
  };

  const statusColors = {
    tentative: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
    rescheduled: 'bg-blue-100 text-blue-800'
  };

  // Get calendar days for current month
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDay = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_datetime);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle event form submission
  const onSubmit = async (data: EventFormData) => {
    try {
      const startDateTime = data.all_day 
        ? `${data.start_date}T00:00:00+05:30`
        : `${data.start_date}T${data.start_time}:00+05:30`;
      
      const endDateTime = data.all_day 
        ? `${data.end_date}T23:59:59+05:30`
        : `${data.end_date}T${data.end_time}:00+05:30`;

      const eventData = {
        title: data.title,
        description: data.description,
        location: data.location,
        start_datetime: startDateTime,
        end_datetime: endDateTime,
        all_day: data.all_day,
        event_type: data.event_type as VendorEvent['event_type'],
        status: data.status as VendorEvent['status'],
        client_name: data.client_name,
        client_phone: data.client_phone,
        client_email: data.client_email,
        color: data.color,
        priority: data.priority as VendorEvent['priority'],
        vendor_id: vendorId
      };

      if (isEditing && selectedEvent) {
        await onEventUpdate(selectedEvent.id, eventData);
      } else {
        await onEventCreate(eventData);
      }

      setShowEventModal(false);
      setIsEditing(false);
      setSelectedEvent(null);
      reset();
      await onEventsRefresh();
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  // Open event modal for new event
  const handleNewEvent = (date?: Date) => {
    reset();
    setIsEditing(false);
    setSelectedEvent(null);
    
    if (date) {
      const dateStr = date.toISOString().split('T')[0];
      setValue('start_date', dateStr);
      setValue('end_date', dateStr);
      setValue('start_time', '09:00');
      setValue('end_time', '17:00');
    }
    
    setValue('event_type', 'booking');
    setValue('status', 'tentative');
    setValue('color', eventTypeColors.booking);
    setValue('priority', 'medium');
    setValue('all_day', false);
    
    setShowEventModal(true);
  };

  // Open event modal for editing
  const handleEditEvent = (event: VendorEvent) => {
    setSelectedEvent(event);
    setIsEditing(true);
    
    const startDate = new Date(event.start_datetime);
    const endDate = new Date(event.end_datetime);
    
    setValue('title', event.title);
    setValue('description', event.description || '');
    setValue('location', event.location || '');
    setValue('start_date', startDate.toISOString().split('T')[0]);
    setValue('start_time', startDate.toTimeString().slice(0, 5));
    setValue('end_date', endDate.toISOString().split('T')[0]);
    setValue('end_time', endDate.toTimeString().slice(0, 5));
    setValue('all_day', event.all_day);
    setValue('event_type', event.event_type);
    setValue('status', event.status);
    setValue('client_name', event.client_name || '');
    setValue('client_phone', event.client_phone || '');
    setValue('client_email', event.client_email || '');
    setValue('color', event.color);
    setValue('priority', event.priority);
    
    setShowEventModal(true);
  };

  // Handle event deletion
  const handleDeleteEvent = async (event: VendorEvent) => {
    if (window.confirm(`Are you sure you want to delete "${event.title}"?`)) {
      try {
        await onEventDelete(event.id);
        await onEventsRefresh();
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  // Navigate calendar
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const navigateToToday = () => {
    setCurrentDate(new Date());
  };

  // Watch for event type changes to update color
  const watchedEventType = watch('event_type');
  useEffect(() => {
    if (watchedEventType && eventTypeColors[watchedEventType as keyof typeof eventTypeColors]) {
      setValue('color', eventTypeColors[watchedEventType as keyof typeof eventTypeColors]);
    }
  }, [watchedEventType, setValue]);

  const calendarDays = getCalendarDays();

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Calendar</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setView('month')}
              className={view === 'month' ? 'bg-blue-100 text-blue-700' : ''}
            >
              Month
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setView('week')}
              className={view === 'week' ? 'bg-blue-100 text-blue-700' : ''}
            >
              Week
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setView('list')}
              className={view === 'list' ? 'bg-blue-100 text-blue-700' : ''}
            >
              List
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={navigateToToday}>
            Today
          </Button>
          <Button onClick={() => handleNewEvent()} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Month View */}
      {view === 'month' && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">
                {currentDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const dayEvents = getEventsForDate(day);
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                const isToday = day.toDateString() === new Date().toDateString();
                
                return (
                  <div
                    key={index}
                    className={`min-h-24 p-1 border border-gray-200 cursor-pointer hover:bg-gray-50 ${
                      !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                    } ${isToday ? 'bg-blue-50 border-blue-200' : ''}`}
                    onClick={() => handleNewEvent(day)}
                  >
                    <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : ''}`}>
                      {day.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map(event => (
                        <div
                          key={event.id}
                          className="text-xs p-1 rounded truncate cursor-pointer hover:opacity-80"
                          style={{ backgroundColor: event.color + '20', color: event.color }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditEvent(event);
                          }}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500 font-medium">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="space-y-4">
          {events
            .sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime())
            .map(event => (
              <Card key={event.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: event.color }}
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">{event.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {event.all_day ? 'All day' : `${formatTime(event.start_datetime)} - ${formatTime(event.end_datetime)}`}
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </div>
                          )}
                          {event.client_name && (
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {event.client_name}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={statusColors[event.status]}>
                        {event.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditEvent(event)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteEvent(event)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* Event Modal */}
      <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Event' : 'Add New Event'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title *
                </label>
                <Input
                  {...register("title", { required: "Title is required" })}
                  placeholder="Enter event title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Type
                </label>
                <select
                  {...register("event_type")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  {Object.entries(eventTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  {...register("status")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="tentative">Tentative</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="rescheduled">Rescheduled</option>
                </select>
              </div>
            </div>

            {/* Date and Time */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register("all_day")}
                  className="rounded border-gray-300"
                />
                <label className="text-sm font-medium text-gray-700">All Day Event</label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    {...register("start_date")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <Input
                    type="date"
                    {...register("end_date")}
                  />
                </div>
              </div>

              {!watch('all_day') && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <Input
                      type="time"
                      {...register("start_time")}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <Input
                      type="time"
                      {...register("end_time")}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Client Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Name
                </label>
                <Input
                  {...register("client_name")}
                  placeholder="Client or contact person"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Phone
                </label>
                <Input
                  {...register("client_phone")}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <Input
                {...register("location")}
                placeholder="Event location or venue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Textarea
                {...register("description")}
                rows={3}
                placeholder="Event description or notes"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  {...register("priority")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <Input
                  type="color"
                  {...register("color")}
                  className="h-10"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEventModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isEditing ? 'Update Event' : 'Create Event'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorCalendar;
