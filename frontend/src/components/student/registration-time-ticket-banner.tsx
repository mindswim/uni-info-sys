'use client';

import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, Calendar, AlertCircle } from 'lucide-react';
import { getAuthHeaders } from '@/lib/api-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost/api/v1';

interface TimeTicket {
  id: number;
  student_id: number;
  term_id: number;
  start_time: string;
  end_time: string;
  priority_group: string;
  status: 'pending' | 'active' | 'expired';
  term: {
    id: number;
    name: string;
    type: string;
  };
}

export function RegistrationTimeTicketBanner() {
  const [ticket, setTicket] = useState<TimeTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState<string>('');

  useEffect(() => {
    fetchTimeTicket();
  }, []);

  useEffect(() => {
    if (!ticket) return;

    const interval = setInterval(() => {
      const now = new Date();
      const startTime = new Date(ticket.start_time);
      const endTime = new Date(ticket.end_time);

      if (ticket.status === 'pending' || (now < startTime && ticket.status === 'active')) {
        const diff = startTime.getTime() - now.getTime();

        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);

          if (days > 0) {
            setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
          } else if (hours > 0) {
            setCountdown(`${hours}h ${minutes}m ${seconds}s`);
          } else if (minutes > 0) {
            setCountdown(`${minutes}m ${seconds}s`);
          } else {
            setCountdown(`${seconds}s`);
          }
        } else {
          fetchTimeTicket();
        }
      } else if (now >= startTime && now <= endTime && ticket.status === 'active') {
        const endDiff = endTime.getTime() - now.getTime();

        if (endDiff > 0) {
          const hours = Math.floor(endDiff / (1000 * 60 * 60));
          const minutes = Math.floor((endDiff % (1000 * 60 * 60)) / (1000 * 60));
          setCountdown(`${hours}h ${minutes}m remaining`);
        } else {
          fetchTimeTicket();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [ticket]);

  const fetchTimeTicket = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/registration-time-tickets/me`, { headers });

      if (response.ok) {
        const data = await response.json();
        setTicket(data.data);
      } else if (response.status === 404) {
        setTicket(null);
      }
    } catch (error) {
      console.error('Error fetching time ticket:', error);
      setTicket(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading || !ticket) {
    return null;
  }

  const now = new Date();
  const startTime = new Date(ticket.start_time);
  const endTime = new Date(ticket.end_time);
  const isActive = now >= startTime && now <= endTime && ticket.status === 'active';
  const isPending = now < startTime && (ticket.status === 'pending' || ticket.status === 'active');
  const isExpired = ticket.status === 'expired' || now > endTime;

  if (isExpired) {
    return (
      <Alert className="bg-gray-50 border-gray-200">
        <Calendar className="h-4 w-4 text-gray-600" />
        <AlertTitle className="text-gray-900">Registration Window Closed</AlertTitle>
        <AlertDescription className="text-gray-700">
          Your registration time for {ticket.term.name} has expired. Contact the registrar
          if you need assistance.
        </AlertDescription>
      </Alert>
    );
  }

  if (isActive) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-900 flex items-center gap-2">
          Registration Open
          <Badge className="bg-green-600 text-white">Active</Badge>
        </AlertTitle>
        <AlertDescription className="text-green-700 space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="font-semibold">{countdown}</span>
          </div>
          <div className="text-sm">
            Your registration window for <strong>{ticket.term.name}</strong> is now open.
            Register for your courses before{' '}
            <strong>{formatDateTime(ticket.end_time)}</strong>.
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="outline" className="bg-white">
              Priority Group: {ticket.priority_group}
            </Badge>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (isPending) {
    return (
      <Alert className="bg-blue-50 border-blue-200">
        <Clock className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-900 flex items-center gap-2">
          Registration Opens Soon
          <Badge className="bg-blue-600 text-white">Upcoming</Badge>
        </AlertTitle>
        <AlertDescription className="text-blue-700 space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span className="font-semibold">Opens in: {countdown}</span>
          </div>
          <div className="text-sm">
            Your registration window for <strong>{ticket.term.name}</strong> opens on{' '}
            <strong>{formatDateTime(ticket.start_time)}</strong> and closes on{' '}
            <strong>{formatDateTime(ticket.end_time)}</strong>.
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="outline" className="bg-white">
              Priority Group: {ticket.priority_group}
            </Badge>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
