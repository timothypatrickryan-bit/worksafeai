// Industry & Type of Work Configuration
// Geared toward Construction & Utility contractors

const INDUSTRIES = {
  GENERAL_CONTRACTING: 'General Contracting',
  ELECTRICAL: 'Electrical',
  PLUMBING_HVAC: 'Plumbing & HVAC',
  EXCAVATION_DEMOLITION: 'Excavation & Demolition',
  HEAVY_EQUIPMENT: 'Heavy Equipment Operation',
  UTILITY_SERVICES: 'Utility Services',
  CONCRETE_MASONRY: 'Concrete & Masonry',
  ROOFING: 'Roofing',
  STEEL_ERECTION: 'Steel Erection',
  PIPELINE_UTILITIES: 'Pipeline & Underground Utilities',
  TELECOMMUNICATIONS: 'Telecommunications',
  OTHER: 'Other'
};

const TYPES_OF_WORK = {
  GENERAL_CONTRACTING: [
    'Site Preparation',
    'Foundation Work',
    'Framing & Structural',
    'Interior Finish',
    'Project Management',
    'Quality Inspection',
    'Other'
  ],
  ELECTRICAL: [
    'Residential Wiring',
    'Commercial Installation',
    'High Voltage Work',
    'Troubleshooting & Repair',
    'Panel Installation',
    'Cable Management',
    'Other'
  ],
  PLUMBING_HVAC: [
    'Pipe Installation',
    'System Design',
    'Maintenance & Repair',
    'Inspection & Testing',
    'Backflow Prevention',
    'Emergency Service',
    'Other'
  ],
  EXCAVATION_DEMOLITION: [
    'Site Excavation',
    'Controlled Demolition',
    'Grade Work',
    'Equipment Operation',
    'Material Removal',
    'Debris Management',
    'Other'
  ],
  HEAVY_EQUIPMENT: [
    'Crane Operation',
    'Excavator Operation',
    'Loader Operation',
    'Paver Operation',
    'Compactor Operation',
    'Maintenance & Inspection',
    'Other'
  ],
  UTILITY_SERVICES: [
    'Gas Line Installation',
    'Electric Distribution',
    'Water Main Work',
    'Sewer Services',
    'Emergency Response',
    'System Maintenance',
    'Other'
  ],
  CONCRETE_MASONRY: [
    'Concrete Pouring',
    'Finishing & Troweling',
    'Brick/Block Laying',
    'Mortar Preparation',
    'Curing & Sealing',
    'Repair & Patching',
    'Other'
  ],
  ROOFING: [
    'Shingle Installation',
    'Metal Roofing',
    'Membrane Installation',
    'Flashing & Sealing',
    'Inspection & Repair',
    'Safety Fall Protection',
    'Other'
  ],
  STEEL_ERECTION: [
    'Beam Installation',
    'Column Placement',
    'Connection Work',
    'Rigging & Hoisting',
    'Safety Protocols',
    'Welding & Fastening',
    'Other'
  ],
  PIPELINE_UTILITIES: [
    'Pipeline Installation',
    'Trenching & Backfill',
    'Joint Assembly',
    'Pressure Testing',
    'Cathodic Protection',
    'Maintenance & Repair',
    'Other'
  ],
  TELECOMMUNICATIONS: [
    'Network Installation',
    'Cable Splicing',
    'Tower Maintenance',
    'Fiber Optic Work',
    'Equipment Testing',
    'Infrastructure Maintenance',
    'Other'
  ],
  OTHER: [
    'Custom Work',
    'Mixed Scope',
    'Other'
  ]
};

// Helper function to get types of work for an industry
const getTypesOfWork = (industry) => {
  return TYPES_OF_WORK[industry] || TYPES_OF_WORK.OTHER;
};

// Helper function to validate industry
const isValidIndustry = (industry) => {
  return Object.values(INDUSTRIES).includes(industry);
};

// Helper function to validate type of work for industry
const isValidTypeOfWork = (industry, typeOfWork) => {
  const types = getTypesOfWork(industry);
  return types.includes(typeOfWork);
};

module.exports = {
  INDUSTRIES,
  TYPES_OF_WORK,
  getTypesOfWork,
  isValidIndustry,
  isValidTypeOfWork
};
