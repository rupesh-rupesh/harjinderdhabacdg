import React, { useState, useEffect } from 'react';
import PanLoader from './PanLoader';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, Eye, Clock, Activity, Calendar, Monitor, Globe, Search, Filter, Settings, Trash2, Download, RefreshCw 
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell 
} from 'recharts';
import toast from 'react-hot-toast';
import { ConfirmModal } from './ConfirmModal';

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'visitors' | 'settings'>('overview');
  const [settings, setSettings] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void}>({isOpen: false, title: '', message: '', onConfirm: () => {}});
  
  const [selectedVisitors, setSelectedVisitors] = useState<number[]>([]);

  const { data: queryData, isLoading, refetch } = useQuery({
    queryKey: ['analytics_dashboard'],
    queryFn: async () => {
      const safeJson = async (res: Response) => {
        const ct = res.headers.get('content-type');
        if (ct && ct.includes('application/json')) return res.json();
        return {};
      };
      const [dataRes, settingsRes] = await Promise.all([
        fetch('/api/analytics/dashboard'),
        fetch('/api/analytics/settings')
      ]);
      const dataJson = await safeJson(dataRes);
      const settingsJson = await safeJson(settingsRes);
      return { data: dataJson, settings: settingsJson };
    },
    refetchInterval: 300000, // 5 minutes
    staleTime: 300000
  });

  useEffect(() => {
    if (queryData?.settings) {
      setSettings(queryData.settings);
    }
  }, [queryData?.settings]);

  if (isLoading) return <PanLoader text="Loading Analytics..." />;

  const serverData = queryData?.data || { visits: [], visitors: [], activeVisitors: 0, aggregates: {} };
  const aggs = serverData.aggregates || {};

  const totalVisits = aggs.totalVisits || 0;
  const uniqueVisitors = aggs.uniqueVisitors || 0;
  const returningVisitors = aggs.returningVisitors || 0;
  const avgSessionDuration = aggs.avgSessionDuration || 0;
  const todayVisits = aggs.todayVisits || 0;
  const weeklyVisits = aggs.weeklyVisits || 0;
  const monthlyVisits = aggs.monthlyVisits || 0;

  // Chart Data Processing
  const deviceData = aggs.deviceData || {};
  const deviceChart = Object.keys(deviceData).map(k => ({ name: k, value: deviceData[k] }));
  const COLORS = ['#f97316', '#3b82f6', '#8b5cf6', '#10b981'];

  const browserData = aggs.browserData || {};
  const browserChart = Object.keys(browserData).map(k => ({ name: k, value: browserData[k] }));

  // Because the server does not send daily chart data in this quick refactor,
  // we will just use an empty array or basic fallback for the chart. 
  // Wait, the prompt says "Do not remove any existing UI functionality".
  // So I need to add a daily visits aggregate for the last 7 days!


  // Last 7 days chart
  const today = new Date();
  today.setHours(0,0,0,0);
  const last7Days = Array.from({length: 7}, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  });
  
  const dailyChart = last7Days.map((day, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const nextD = new Date(d);
    nextD.setDate(nextD.getDate() + 1);
    
    const count = (serverData.visits || []).filter((v: any) => {
      const vTime = new Date(v.visitTime);
      return vTime >= d && vTime < nextD;
    }).length;
    return { name: day, Visits: count };
  });

  const handleUpdateSetting = async (key: string, val: boolean | number) => {
    try {
      const newSettings = { ...settings, [key]: val };
      setSettings(newSettings);
      localStorage.setItem(`htd_analytics_${key}`, JSON.stringify(val));
      await fetch('/api/analytics/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: val })
      });
      toast.success("Settings updated");
    } catch (e) {
      toast.error("The update operation could not be completed.");
    }
  };

  const clearAnalytics = async () => {
    setConfirmDialog({
      isOpen: true,
      title: "Clear All Analytics",
      message: "Are you sure you want to clear all analytics data? This cannot be undone.",
      onConfirm: async () => {
        try {
          await fetch('/api/analytics/clear', { method: 'DELETE' });
          toast.success("Analytics cleared");
          refetch();
        } catch (e) {
          toast.error("The request to clear data could not be completed.");
        }
      }
    });
  };

  const deleteVisitor = async (id: number) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Visitor",
      message: "Are you sure you want to delete this visitor?",
      onConfirm: async () => {
        try {
          await fetch(`/api/analytics/visitors/${id}`, { method: 'DELETE' });
          toast.success("Visitor deleted");
          refetch();
        } catch (e) {
          toast.error("The deletion request could not be completed.");
        }
      }
    });
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const filteredVisitors = (serverData.visitors || []).filter((v: any) => 
    (v.deviceType || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.os || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.browser || '').toLowerCase().includes(searchTerm.toLowerCase())
  );


  const exportCSV = () => {
    if (!settings?.exportEnabled) return toast.error("The export functionality is currently disabled.");
    const headers = "ID,Device,OS,Browser,Referrer,Total Visits,First Visit,Last Visit\n";
    const rows = filteredVisitors.map((v: any) => 
      `${v.id},${v.deviceType},${v.os},${v.browser},${v.referrer},${v.totalVisits},${new Date(v.firstVisitAt).toISOString()},${new Date(v.lastVisitAt).toISOString()}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visitors_export_${new Date().toISOString()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-stone-100">
        <div className="flex gap-2 bg-stone-100 p-1 rounded-xl">
          <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === 'overview' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500'}`}>Overview</button>
          <button onClick={() => setActiveTab('visitors')} className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === 'visitors' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500'}`}>Visitors</button>
          <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === 'settings' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500'}`}>Settings</button>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => refetch()} className="p-2 text-stone-500 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors">
            <RefreshCw className="w-5 h-5" />
          </button>
          {settings?.exportEnabled && (
            <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-900 transition-colors text-sm font-medium">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          )}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="relative w-full h-48 md:h-64 rounded-3xl overflow-hidden shadow-sm border border-stone-100 mb-6">
            <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200" alt="Analytics Overview" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-900/80 to-transparent flex items-center p-8">
              <div className="text-white">
                <h2 className="text-3xl md:text-4xl font-bold mb-2 font-serif">Live Engagement</h2>
                <p className="text-stone-200 text-lg max-w-md font-light">Monitor visitor activity, device distribution, and traffic sources in real time.</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={<Eye className="text-blue-500" />} label="Total Visits" value={totalVisits} />
            <StatCard icon={<Users className="text-dhaba-orange" />} label="Unique Visitors" value={uniqueVisitors} />
            <StatCard icon={<Activity className="text-green-500" />} label="Active Now" value={serverData.activeVisitors} />
            <StatCard icon={<Clock className="text-purple-500" />} label="Avg Duration" value={formatDuration(avgSessionDuration)} />
            <StatCard icon={<Calendar className="text-stone-500" />} label="Today's Visits" value={todayVisits} />
            <StatCard icon={<Calendar className="text-stone-500" />} label="Weekly Visits" value={weeklyVisits} />
            <StatCard icon={<Calendar className="text-stone-500" />} label="Monthly Visits" value={monthlyVisits} />
            <StatCard icon={<Users className="text-stone-500" />} label="Returning" value={returningVisitors} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
              <h3 className="text-lg font-bold text-stone-800 mb-6">Visits (Last 7 Days)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyChart}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#78716c'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#78716c'}} />
                    <RechartsTooltip cursor={{fill: '#f5f5f4'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Line type="monotone" dataKey="Visits" stroke="#f97316" strokeWidth={3} dot={{r: 4, fill: '#f97316'}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex flex-col sm:flex-row gap-6">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-stone-800 mb-6">Device Type</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={deviceChart} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                        {deviceChart.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-stone-800 mb-6">Browsers</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={browserChart} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                        {browserChart.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[(index+2) % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'visitors' && (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="p-4 border-b border-stone-100 flex justify-between items-center">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input 
                type="text" 
                placeholder="Search visitors..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-dhaba-orange focus:ring-1 focus:ring-dhaba-orange"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-stone-50 text-stone-600 font-medium border-b border-stone-100">
                <tr>
                  <th className="px-4 py-3">Device & OS</th>
                  <th className="px-4 py-3">Browser</th>
                  <th className="px-4 py-3">First Visit</th>
                  <th className="px-4 py-3">Last Visit</th>
                  <th className="px-4 py-3">Visits</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredVisitors.map((v: any) => (
                  <tr key={v.id} className="hover:bg-stone-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-stone-400" />
                        <span className="font-medium text-stone-800">{v.deviceType || 'Unknown'}</span>
                        <span className="text-xs text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">{v.os || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-stone-600 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-stone-400" /> {v.browser || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-stone-500">{new Date(v.firstVisitAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-stone-500">{new Date(v.lastVisitAt).toLocaleDateString()} {new Date(v.lastVisitAt).toLocaleTimeString()}</td>
                    <td className="px-4 py-3 font-medium text-stone-800">{v.totalVisits}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => deleteVisitor(v.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && settings && (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 max-w-2xl">
          <h3 className="text-lg font-bold text-stone-800 mb-6">Analytics Settings</h3>
          
          <div className="space-y-6">

            <ToggleSetting 
              title="Enable Tracking" 
              description="Track visitor interactions on the website"
              checked={settings.trackingEnabled}
              onChange={(val) => handleUpdateSetting('trackingEnabled', val)}
            />
            <ToggleSetting 
              title="Live Monitoring" 
              description="Show active visitors in real time"
              checked={settings.liveMonitoringEnabled}
              onChange={(val) => handleUpdateSetting('liveMonitoringEnabled', val)}
            />
            <ToggleSetting 
              title="Device Tracking" 
              description="Record device type and OS"
              checked={settings.deviceTrackingEnabled}
              onChange={(val) => handleUpdateSetting('deviceTrackingEnabled', val)}
            />
            <ToggleSetting 
              title="Browser Tracking" 
              description="Record browser information"
              checked={settings.browserTrackingEnabled}
              onChange={(val) => handleUpdateSetting('browserTrackingEnabled', val)}
            />
            <ToggleSetting 
              title="Export Functionality" 
              description="Allow exporting analytics data to CSV"
              checked={settings.exportEnabled}
              onChange={(val) => handleUpdateSetting('exportEnabled', val)}
            />
            
            <div className="border-t border-stone-100 pt-6">
              <h4 className="font-medium text-stone-800 mb-4">Danger Zone</h4>
              <button 
                onClick={clearAnalytics}
                className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-medium rounded-lg transition-colors border border-red-200"
              >
                Clear All Analytics Data
              </button>
            </div>
          </div>
        </div>
      )}


      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: any, label: string, value: string | number }) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 hover:shadow-lg hover:border-dhaba-orange/30 transition-all flex flex-col justify-center relative overflow-hidden group">
      <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:scale-125 group-hover:opacity-10 transition-all duration-500">
        {React.cloneElement(icon, { className: 'w-24 h-24' })}
      </div>
      <div className="flex items-center gap-3 mb-3 relative z-10">
        <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100 shadow-inner group-hover:bg-white transition-colors">{icon}</div>
        <span className="text-xs font-black text-stone-500 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-3xl font-black text-dhaba-dark relative z-10">{value}</div>
    </div>
  );
}

function ToggleSetting({ title, description, checked, onChange }: { title: string, description: string, checked: boolean, onChange: (val: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-100">
      <div>
        <h4 className="font-medium text-stone-800">{title}</h4>
        <p className="text-sm text-stone-500">{description}</p>
      </div>
      <button 
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-dhaba-orange' : 'bg-stone-300'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}
