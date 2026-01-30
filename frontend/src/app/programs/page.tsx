'use client';

import { useState, useEffect } from 'react';
import { Search, GraduationCap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';

interface Program {
  id: number;
  name: string;
  code: string;
  degree_level: string;
  description: string;
  department: {
    id: number;
    name: string;
    faculty: {
      id: number;
      name: string;
    };
  };
  credit_hours_required: number;
  duration_years: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost/api/v1';

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [degreeLevel, setDegreeLevel] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPrograms();
  }, []);

  useEffect(() => {
    filterPrograms();
  }, [searchQuery, degreeLevel, programs]);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/programs`);

      if (!response.ok) {
        throw new Error('Failed to fetch programs');
      }

      const data = await response.json();
      setPrograms(data.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching programs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterPrograms = () => {
    let filtered = [...programs];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (program) =>
          program.name.toLowerCase().includes(query) ||
          program.code.toLowerCase().includes(query) ||
          program.description?.toLowerCase().includes(query) ||
          program.department.name.toLowerCase().includes(query)
      );
    }

    if (degreeLevel !== 'all') {
      filtered = filtered.filter((program) => program.degree_level === degreeLevel);
    }

    setFilteredPrograms(filtered);
  };

  const getDegreeLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      'Bachelor': 'bg-blue-100 text-blue-800 border-blue-300',
      'Master': 'bg-purple-100 text-purple-800 border-purple-300',
      'Doctorate': 'bg-amber-100 text-amber-800 border-amber-300',
      'Associate': 'bg-green-100 text-green-800 border-green-300',
      'Certificate': 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return colors[level] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const uniqueDegreeLevels = Array.from(new Set(programs.map((p) => p.degree_level)));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">University Programs</h1>
          </div>
          <p className="text-gray-600">Explore our academic programs and find your path to success</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search programs by name, code, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={degreeLevel} onValueChange={setDegreeLevel}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Degree Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {uniqueDegreeLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading programs...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            <p className="font-semibold">Error loading programs</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && filteredPrograms.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No programs found</p>
            <p className="text-gray-500 text-sm">Try adjusting your search criteria</p>
          </div>
        )}

        {!loading && !error && filteredPrograms.length > 0 && (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Showing {filteredPrograms.length} program{filteredPrograms.length !== 1 ? 's' : ''}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrograms.map((program) => (
                <Card key={program.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={getDegreeLevelColor(program.degree_level)}>
                        {program.degree_level}
                      </Badge>
                      <span className="text-xs text-gray-500 font-mono">{program.code}</span>
                    </div>
                    <CardTitle className="text-xl">{program.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {program.department.name}
                      <br />
                      <span className="text-xs text-gray-500">{program.department.faculty.name}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                      {program.description || 'No description available'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-4">
                      <span>{program.credit_hours_required} credit hours</span>
                      <span>{program.duration_years} years</span>
                    </div>
                    <Link href={`/apply?program=${program.id}`}>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        Apply Now
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
