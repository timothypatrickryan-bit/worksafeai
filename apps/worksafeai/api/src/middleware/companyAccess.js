// Middleware to verify user has access to requested company
const verifyCompanyAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Get company ID from URL params only (not from body to prevent override attacks)
  const requestedCompanyId = req.params.id || req.params.cid;
  
  // Validate UUID format - required for all company operations
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!requestedCompanyId) {
    return res.status(400).json({ error: 'Company ID is required' });
  }
  
  if (!uuidRegex.test(requestedCompanyId)) {
    return res.status(400).json({ error: 'Invalid company ID format' });
  }
  
  // Verify user belongs to this company
  if (requestedCompanyId !== req.user.companyId) {
    return res.status(403).json({ error: 'Access denied to this company' });
  }

  next();
};

// Middleware to verify user can access a specific JTSA (via project)
const verifyJTSAAccess = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const supabase = req.app.locals.supabase;
    const { data: project } = await supabase
      .from('projects')
      .select('company_id')
      .eq('id', req.params.pid || req.params.project_id)
      .single();

    if (!project || project.company_id !== req.user.companyId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { verifyCompanyAccess, verifyJTSAAccess };
