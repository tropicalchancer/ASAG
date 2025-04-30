'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';

interface DWRForm {
  date: string;
  name: string;
  job: string;
  location: string;
  work: string;
  machine: string;
  unit: string;
  hours: string | number;
  notes: string;
}

// Mock data for testing
const mockData: DWRForm[] = [
  {
    date: '2025-04-17',
    name: 'John Doe',
    job: 'JOB123',
    location: 'Site A',
    work: 'Excavation and site preparation',
    machine: 'Excavator',
    unit: 'EX-101',
    hours: 8,
    notes: 'Completed initial excavation'
  },
  {
    date: '2025-04-17',
    name: 'Jane Smith',
    job: 'JOB123',
    location: 'Site A',
    work: 'Material delivery and setup',
    machine: 'Loader',
    unit: 'LD-205',
    hours: 7.5,
    notes: 'Delivered all required materials'
  },
  {
    date: '2025-04-17',
    name: 'Mike Johnson',
    job: 'JOB456',
    location: 'Site B',
    work: 'Foundation work',
    machine: 'Concrete Mixer',
    unit: 'CM-302',
    hours: 6,
    notes: 'Started foundation pouring'
  }
];

export default function TestPage() {
  const [data, setData] = useState<DWRForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  const fetchMockData = (date: string) => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      if (date === '2025-04-17') {
        setData(mockData);
      } else {
        setData([]);
      }
      setLoading(false);
    }, 800);
  };

  const downloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DWR');
    
    XLSX.writeFile(wb, `DWR_${selectedDate}.xlsx`);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedDate) {
      fetchMockData(selectedDate);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Daily Work Reports (Test Page)</h1>
              <div className="flex space-x-4">
                <p className="text-sm text-blue-600">Using mock data - try date: 2025-04-17</p>
                <button
                  onClick={downloadExcel}
                  disabled={!data.length}
                  className={`px-4 py-2 rounded-md text-white ${
                    data.length ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400'
                  } transition-colors`}
                >
                  Download Excel
                </button>
              </div>
            </div>
          </div>

          {/* Date Picker Form */}
          <div className="px-6 py-4 border-b border-gray-200">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="w-full sm:w-auto">
                <label htmlFor="date-picker" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Date
                </label>
                <input
                  type="date"
                  id="date-picker"
                  value={selectedDate}
                  onChange={handleDateChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-4 sm:mt-0"
              >
                Fetch Report
              </button>
            </form>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="text-gray-600">Loading data...</div>
              </div>
            ) : data.length === 0 && selectedDate ? (
              <div className="text-center py-12">
                <div className="text-gray-600 mb-2">No DWR data available for {selectedDate}</div>
                <div className="text-sm text-gray-500">
                  Try selecting a different date (hint: use 2025-04-17)
                </div>
              </div>
            ) : !selectedDate ? (
              <div className="text-center py-12">
                <div className="text-gray-600 mb-2">Please select a date and click &quot;Fetch Report&quot; to view data</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Machine</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((row, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.job}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.location}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{row.work}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.machine}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.unit}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.hours}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{row.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 