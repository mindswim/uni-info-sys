'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getAuthHeaders } from '@/lib/api-client';
import { CheckCircle, XCircle, AlertCircle, ArrowRight } from 'lucide-react';

interface Program {
  id: number;
  name: string;
  code: string;
  degree_level: string;
}

interface Requirement {
  category: string;
  required_credits: number;
  earned_credits: number;
  in_progress_credits: number;
  remaining_credits: number;
  satisfied: boolean;
  courses: Array<{
    code: string;
    name: string;
    credits: number;
    grade: string | null;
    status: 'completed' | 'in_progress' | 'planned';
  }>;
}

interface DegreeAudit {
  program: {
    id: number;
    name: string;
    code: string;
  };
  total_credits_required: number;
  total_credits_earned: number;
  total_credits_in_progress: number;
  gpa: number;
  requirements: Requirement[];
  overall_satisfied: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost/api/v1';

export default function WhatIfAnalysisPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<string>('');
  const [currentAudit, setCurrentAudit] = useState<DegreeAudit | null>(null);
  const [hypotheticalAudit, setHypotheticalAudit] = useState<DegreeAudit | null>(null);
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPrograms();
    fetchCurrentAudit();
  }, []);

  const fetchPrograms = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/programs`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setPrograms(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching programs:', err);
    }
  };

  const fetchCurrentAudit = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/degree-audit`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentAudit(data.data);
      }
    } catch (err) {
      console.error('Error fetching current audit:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = async () => {
    if (!selectedProgramId) {
      setError('Please select a program to simulate');
      return;
    }

    try {
      setSimulating(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/degree-audit/what-if`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          program_id: parseInt(selectedProgramId),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to simulate degree audit');
      }

      const data = await response.json();
      setHypotheticalAudit(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error simulating audit:', err);
    } finally {
      setSimulating(false);
    }
  };

  const getRequirementBadge = (requirement: Requirement) => {
    if (requirement.satisfied) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-300">
          <CheckCircle className="h-3 w-3 mr-1" />
          Satisfied
        </Badge>
      );
    } else if (requirement.remaining_credits <= 6) {
      return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-300">
          <AlertCircle className="h-3 w-3 mr-1" />
          Near Complete
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-300">
          <XCircle className="h-3 w-3 mr-1" />
          Not Satisfied
        </Badge>
      );
    }
  };

  const renderAuditCard = (audit: DegreeAudit, title: string, description: string) => (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-sm font-semibold text-gray-900">{audit.program.name}</div>
          <div className="text-xs text-gray-600">{audit.program.code}</div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div>
            <div className="text-xs text-gray-600">Credits Earned</div>
            <div className="text-2xl font-bold text-blue-700">
              {audit.total_credits_earned}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600">Credits Required</div>
            <div className="text-2xl font-bold text-gray-900">
              {audit.total_credits_required}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600">In Progress</div>
            <div className="text-lg font-semibold text-amber-700">
              {audit.total_credits_in_progress}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600">Current GPA</div>
            <div className="text-lg font-semibold text-gray-900">
              {audit.gpa.toFixed(2)}
            </div>
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold mb-2">Overall Status</div>
          {audit.overall_satisfied ? (
            <Badge className="bg-green-100 text-green-800 border-green-300">
              <CheckCircle className="h-4 w-4 mr-1" />
              Requirements Satisfied
            </Badge>
          ) : (
            <Badge className="bg-red-100 text-red-800 border-red-300">
              <XCircle className="h-4 w-4 mr-1" />
              Requirements Not Satisfied
            </Badge>
          )}
        </div>

        <div className="space-y-3">
          <div className="text-sm font-semibold">Requirements</div>
          {audit.requirements.map((req, index) => (
            <div key={index} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{req.category}</span>
                {getRequirementBadge(req)}
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="text-gray-600">Required</div>
                  <div className="font-semibold">{req.required_credits}</div>
                </div>
                <div>
                  <div className="text-gray-600">Earned</div>
                  <div className="font-semibold text-green-700">{req.earned_credits}</div>
                </div>
                <div>
                  <div className="text-gray-600">Remaining</div>
                  <div className="font-semibold text-red-700">{req.remaining_credits}</div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    req.satisfied ? 'bg-green-500' : 'bg-amber-500'
                  }`}
                  style={{
                    width: `${Math.min(
                      ((req.earned_credits + req.in_progress_credits) / req.required_credits) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">What-If Analysis</h1>
          <p className="text-gray-600 mt-1">
            Simulate how your academic progress would look in a different program
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Simulate Program Change</CardTitle>
            <CardDescription>
              Select a program to see how your current credits would apply
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Select value={selectedProgramId} onValueChange={setSelectedProgramId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a program to simulate" />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map((program) => (
                      <SelectItem key={program.id} value={program.id.toString()}>
                        {program.name} ({program.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleSimulate}
                disabled={!selectedProgramId || simulating || loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {simulating ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                    Simulating...
                  </span>
                ) : (
                  'Simulate'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {loading && !currentAudit ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading your current degree audit...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {currentAudit && (
              <div>
                {renderAuditCard(
                  currentAudit,
                  'Current Program',
                  'Your current degree progress and requirements'
                )}
              </div>
            )}

            {hypotheticalAudit ? (
              <div className="relative">
                <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 hidden lg:block">
                  <ArrowRight className="h-8 w-8 text-blue-600" />
                </div>
                {renderAuditCard(
                  hypotheticalAudit,
                  'Hypothetical Program',
                  'How your progress would look in the selected program'
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-12">
                <div className="text-center text-gray-500">
                  <p className="text-lg font-medium mb-2">No Simulation Yet</p>
                  <p className="text-sm">
                    Select a program and click "Simulate" to see the comparison
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
