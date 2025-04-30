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

interface APIError {
  error: string;
  message: string;
}

export default function DailyPage() {
  const [data, setData] = useState<DWRForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<APIError | null>(null);
  const [selectedDate, setSelectedDate] = useState('');

  const fetchData = async (date: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/dwr?date=${date}`);
      const jsonData = await response.json();
      
      if (!response.ok) {
        throw jsonData;
      }
      
      setData(jsonData);
    } catch (err) {
      setError(err as APIError);
      setData([]);
    } finally {
      setLoading(false);
    }
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
      fetchData(selectedDate);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Daily Work Reports</h1>
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
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-600 font-medium mb-2">
                  {error.error}
                </div>
                <div className="text-gray-600 mb-4">
                  {error.message}
                </div>
                <div className="text-sm text-gray-500">
                  Need help? Check the README.md file for setup instructions
                </div>
              </div>
            ) : data.length === 0 && selectedDate ? (
              <div className="text-center py-12">
                <div className="text-gray-600 mb-2">No DWR data available for {selectedDate}</div>
                <div className="text-sm text-gray-500">
                  Try selecting a different date
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