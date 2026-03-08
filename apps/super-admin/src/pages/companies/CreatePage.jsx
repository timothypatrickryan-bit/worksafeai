import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import useForm from '../../hooks/useForm';
import useNotificationStore from '../../stores/notificationStore';
import companiesAPI from '../../api/companies';

const INDUSTRIES = [
  'General Contracting',
  'Electrical',
  'Plumbing & HVAC',
  'Excavation & Demolition',
  'Heavy Equipment Operation',
  'Utility Services',
  'Concrete & Masonry',
  'Roofing',
  'Steel Erection',
  'Pipeline & Underground Utilities',
  'Telecommunications',
  'Other',
];

export default function CompaniesCreatePage() {
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const [step, setStep] = useState(1);

  const validate = (values) => {
    const errors = {};

    if (step === 1) {
      if (!values.name?.trim()) errors.name = 'Company name required';
      if (!values.email?.trim()) errors.email = 'Email required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        errors.email = 'Invalid email';
      }
      if (!values.phone?.trim()) errors.phone = 'Phone required';
    } else if (step === 2) {
      if (!values.industry) errors.industry = 'Industry required';
      if (!values.companySize) errors.companySize = 'Company size required';
    } else if (step === 3) {
      if (!values.address?.trim()) errors.address = 'Address required';
      if (!values.city?.trim()) errors.city = 'City required';
      if (!values.state?.trim()) errors.state = 'State required';
      if (!values.zip?.trim()) errors.zip = 'ZIP code required';
    }

    return errors;
  };

  const onSubmit = async (values) => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      try {
        await companiesAPI.create({
          name: values.name,
          email: values.email,
          phone: values.phone,
          industry: values.industry,
          companySize: values.companySize,
          address: values.address,
          city: values.city,
          state: values.state,
          zip: values.zip,
        });
        addNotification(`${values.name} created successfully!`, 'success');
        navigate('/companies');
      } catch (err) {
        addNotification(`Failed to create company: ${err.message}`, 'error');
      }
    }
  };

  const form = useForm(
    {
      name: '',
      email: '',
      phone: '',
      industry: '',
      companySize: '',
      address: '',
      city: '',
      state: '',
      zip: '',
    },
    onSubmit,
    validate
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
            <div>
              <label htmlFor="company-name" className="block text-sm font-medium text-slate-300 mb-2">
                Company Name *
              </label>
              <input
                id="company-name"
                {...form.getFieldProps('name')}
                type="text"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ABC Construction"
              />
              {form.errors.name && form.touched.name && (
                <p className="text-red-400 text-sm mt-1" role="alert">
                  {form.errors.name}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email *
              </label>
              <input
                id="email"
                {...form.getFieldProps('email')}
                type="email"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="contact@company.com"
              />
              {form.errors.email && form.touched.email && (
                <p className="text-red-400 text-sm mt-1" role="alert">
                  {form.errors.email}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-2">
                Phone *
              </label>
              <input
                id="phone"
                {...form.getFieldProps('phone')}
                type="tel"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(555) 123-4567"
              />
              {form.errors.phone && form.touched.phone && (
                <p className="text-red-400 text-sm mt-1" role="alert">
                  {form.errors.phone}
                </p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Industry & Size</h3>
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-slate-300 mb-2">
                Industry *
              </label>
              <select
                id="industry"
                {...form.getFieldProps('industry')}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select industry</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
              {form.errors.industry && form.touched.industry && (
                <p className="text-red-400 text-sm mt-1" role="alert">
                  {form.errors.industry}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="companySize" className="block text-sm font-medium text-slate-300 mb-2">
                Company Size *
              </label>
              <select
                id="companySize"
                {...form.getFieldProps('companySize')}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="200+">200+ employees</option>
              </select>
              {form.errors.companySize && form.touched.companySize && (
                <p className="text-red-400 text-sm mt-1" role="alert">
                  {form.errors.companySize}
                </p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Address</h3>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-slate-300 mb-2">
                Street Address *
              </label>
              <input
                id="address"
                {...form.getFieldProps('address')}
                type="text"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123 Main St"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-slate-300 mb-2">
                  City *
                </label>
                <input
                  id="city"
                  {...form.getFieldProps('city')}
                  type="text"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="City"
                />
              </div>
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-slate-300 mb-2">
                  State *
                </label>
                <input
                  id="state"
                  {...form.getFieldProps('state')}
                  type="text"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="CA"
                />
              </div>
              <div>
                <label htmlFor="zip" className="block text-sm font-medium text-slate-300 mb-2">
                  ZIP *
                </label>
                <input
                  id="zip"
                  {...form.getFieldProps('zip')}
                  type="text"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="12345"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/companies')}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Companies
        </button>
        <h1 className="text-3xl font-bold text-white">Create Company</h1>
        <p className="text-slate-400 mt-2">Step {step} of 3</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8 flex gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-2 flex-1 rounded-full transition-colors ${
              s <= step ? 'bg-blue-600' : 'bg-slate-700'
            }`}
          />
        ))}
      </div>

      {/* Form */}
      <form onSubmit={form.handleSubmit} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        {renderStep()}

        {/* Actions */}
        <div className="flex gap-3 mt-8 justify-between">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
            >
              Previous
            </button>
          )}
          <div className="flex gap-3 ml-auto">
            <button
              type="button"
              onClick={() => navigate('/companies')}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={form.isSubmitting}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {step === 3 ? (form.isSubmitting ? 'Creating...' : 'Create Company') : 'Next'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
