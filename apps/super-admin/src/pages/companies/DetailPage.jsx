import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Edit2, Save, X } from 'lucide-react';
import useNotificationStore from '../../stores/notificationStore';
import useForm from '../../hooks/useForm';
import companiesAPI from '../../api/companies';

// Mock get company
const mockGetCompany = async (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id,
        name: 'ABC Construction Inc',
        email: 'contact@abcconstruction.com',
        phone: '(555) 123-4567',
        industry: 'General Contracting',
        companySize: '51-200',
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zip: '94102',
        status: 'active',
        plan: 'pro',
        employees: 87,
        createdAt: '2025-10-15',
      });
    }, 500);
  });
};

export default function CompanyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const [company, setCompany] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCompany = async () => {
      try {
        const data = await mockGetCompany(id);
        setCompany(data);
      } catch (err) {
        addNotification('Failed to load company', 'error');
        navigate('/companies');
      } finally {
        setLoading(false);
      }
    };

    loadCompany();
  }, [id, navigate, addNotification]);

  const validate = (values) => {
    const errors = {};
    if (!values.name?.trim()) errors.name = 'Company name required';
    if (!values.email?.trim()) errors.email = 'Email required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errors.email = 'Invalid email';
    }
    if (!values.phone?.trim()) errors.phone = 'Phone required';
    return errors;
  };

  const onSubmit = async (values) => {
    try {
      // TODO: Call API to update
      setCompany({ ...company, ...values });
      setIsEditing(false);
      addNotification('Company updated successfully', 'success');
    } catch (err) {
      addNotification(`Failed to update: ${err.message}`, 'error');
    }
  };

  const form = useForm(company || {}, onSubmit, validate);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-400">Company not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/companies')}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Companies
        </button>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            isEditing
              ? 'bg-slate-700 hover:bg-slate-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isEditing ? (
            <>
              <X className="w-5 h-5" />
              Cancel
            </>
          ) : (
            <>
              <Edit2 className="w-5 h-5" />
              Edit
            </>
          )}
        </button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">{company.name}</h1>
        <p className="text-slate-400 mt-2">{company.email}</p>
      </div>

      {/* Status Badges */}
      <div className="flex gap-3">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300">
          {company.status}
        </span>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300">
          {company.plan.toUpperCase()}
        </span>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-700 text-slate-300">
          {company.employees} employees
        </span>
      </div>

      {/* Form */}
      {isEditing ? (
        <form onSubmit={form.handleSubmit} className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                Company Name
              </label>
              <input
                id="name"
                {...form.getFieldProps('name')}
                type="text"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                id="email"
                {...form.getFieldProps('email')}
                type="email"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-2">
                Phone
              </label>
              <input
                id="phone"
                {...form.getFieldProps('phone')}
                type="tel"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-slate-300 mb-2">
                Industry
              </label>
              <input
                id="industry"
                {...form.getFieldProps('industry')}
                type="text"
                disabled
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-slate-300 mb-2">
                Address
              </label>
              <input
                id="address"
                {...form.getFieldProps('address')}
                type="text"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-slate-300 mb-2">
                City
              </label>
              <input
                id="city"
                {...form.getFieldProps('city')}
                type="text"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-slate-300 mb-2">
                State
              </label>
              <input
                id="state"
                {...form.getFieldProps('state')}
                type="text"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={form.isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {form.isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          {/* Overview */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-slate-400 text-sm mb-1">Email</p>
              <p className="text-white font-medium">{company.email}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1">Phone</p>
              <p className="text-white font-medium">{company.phone}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1">Industry</p>
              <p className="text-white font-medium">{company.industry}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1">Company Size</p>
              <p className="text-white font-medium">{company.companySize}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1">Address</p>
              <p className="text-white font-medium">
                {company.address}, {company.city}, {company.state} {company.zip}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1">Created</p>
              <p className="text-white font-medium">
                {new Date(company.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-lg font-bold text-white mb-4">Quick Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-left transition-colors">
                <p className="text-sm text-slate-400 mb-1">Employees</p>
                <p className="text-2xl font-bold">{company.employees}</p>
              </button>
              <button className="p-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-left transition-colors">
                <p className="text-sm text-slate-400 mb-1">Plan</p>
                <p className="text-2xl font-bold capitalize">{company.plan}</p>
              </button>
              <button className="p-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-left transition-colors">
                <p className="text-sm text-slate-400 mb-1">Subscription</p>
                <p className="text-lg font-bold">View Details</p>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
