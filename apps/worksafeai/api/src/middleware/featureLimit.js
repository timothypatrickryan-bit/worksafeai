const stripeService = require('../services/stripeService');

/**
 * Feature limit middleware — blocks resource creation if user exceeds tier limits
 * Enforces: employees count, projects count, JTSAs per month
 */

/**
 * Check if company can create a new employee
 */
const checkEmployeeLimit = async (req, res, next) => {
  try {
    const supabase = req.app.locals.supabase;
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get company subscription tier
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('subscription_tier')
      .eq('id', companyId)
      .single();

    if (companyError || !company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const tierConfig = stripeService.SUBSCRIPTION_TIERS[company.subscription_tier] || stripeService.SUBSCRIPTION_TIERS.starter;
    
    // If enterprise, no limits
    if (tierConfig.max_employees === -1) {
      return next();
    }

    // Count current employees
    const { data: employees, error: empError } = await supabase
      .from('users')
      .select('id', { count: 'exact' })
      .eq('company_id', companyId);

    if (empError) {
      return res.status(500).json({ error: 'Failed to check employee limit' });
    }

    const employeeCount = employees?.length || 0;

    if (employeeCount >= tierConfig.max_employees) {
      return res.status(403).json({
        error: `Employee limit reached for ${company.subscription_tier} tier`,
        current: employeeCount,
        limit: tierConfig.max_employees,
        message: `Upgrade to Pro or Enterprise to add more employees. Current: ${employeeCount}/${tierConfig.max_employees}`,
      });
    }

    next();
  } catch (error) {
    console.error('Employee limit check error:', error);
    res.status(500).json({ error: 'Failed to check employee limit' });
  }
};

/**
 * Check if company can create a new project
 */
const checkProjectLimit = async (req, res, next) => {
  try {
    const supabase = req.app.locals.supabase;
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get company subscription tier
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('subscription_tier')
      .eq('id', companyId)
      .single();

    if (companyError || !company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const tierConfig = stripeService.SUBSCRIPTION_TIERS[company.subscription_tier] || stripeService.SUBSCRIPTION_TIERS.starter;
    
    // If unlimited, no limits
    if (tierConfig.max_projects === -1) {
      return next();
    }

    // Count current projects
    const { data: projects, error: projError } = await supabase
      .from('projects')
      .select('id', { count: 'exact' })
      .eq('company_id', companyId);

    if (projError) {
      return res.status(500).json({ error: 'Failed to check project limit' });
    }

    const projectCount = projects?.length || 0;

    if (projectCount >= tierConfig.max_projects) {
      return res.status(403).json({
        error: `Project limit reached for ${company.subscription_tier} tier`,
        current: projectCount,
        limit: tierConfig.max_projects,
        message: `Upgrade to Pro to get unlimited projects. Current: ${projectCount}/${tierConfig.max_projects}`,
      });
    }

    next();
  } catch (error) {
    console.error('Project limit check error:', error);
    res.status(500).json({ error: 'Failed to check project limit' });
  }
};

/**
 * Check if company can create a new JTSA this month
 */
const checkJtsaMonthlyLimit = async (req, res, next) => {
  try {
    const supabase = req.app.locals.supabase;
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get company subscription tier
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('subscription_tier, billing_period_end')
      .eq('id', companyId)
      .single();

    if (companyError || !company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const tierConfig = stripeService.SUBSCRIPTION_TIERS[company.subscription_tier] || stripeService.SUBSCRIPTION_TIERS.starter;
    
    // Calculate monthly JTSA limit from tier config (not stored in SUBSCRIPTION_TIERS yet, add it)
    const jtsaMonthlyLimits = {
      starter: 10,
      pro: 500,
      enterprise: -1, // unlimited
    };
    
    const monthlyLimit = jtsaMonthlyLimits[company.subscription_tier] || 10;

    // If unlimited, no limits
    if (monthlyLimit === -1) {
      return next();
    }

    // Get current month's JTSA count
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

    const { data: jtsas, error: jtsaError } = await supabase
      .from('jtsas')
      .select('id', { count: 'exact' })
      .eq('company_id', companyId)
      .gte('created_at', monthStart)
      .lte('created_at', monthEnd);

    if (jtsaError) {
      return res.status(500).json({ error: 'Failed to check JTSA limit' });
    }

    const jtsaCount = jtsas?.length || 0;

    if (jtsaCount >= monthlyLimit) {
      return res.status(403).json({
        error: `Monthly JTSA limit reached for ${company.subscription_tier} tier`,
        current: jtsaCount,
        limit: monthlyLimit,
        message: `You've reached your monthly JTSA limit (${monthlyLimit}/month). Upgrade to Pro for 500/month or Enterprise for unlimited.`,
      });
    }

    next();
  } catch (error) {
    console.error('JTSA limit check error:', error);
    res.status(500).json({ error: 'Failed to check JTSA limit' });
  }
};

/**
 * Get tier limits for display on dashboard
 */
const getTierLimits = (tier) => {
  const tierConfig = stripeService.SUBSCRIPTION_TIERS[tier] || stripeService.SUBSCRIPTION_TIERS.starter;
  
  return {
    tier,
    limits: {
      max_employees: tierConfig.max_employees,
      max_projects: tierConfig.max_projects,
      max_jtsas_per_month: tier === 'starter' ? 10 : tier === 'pro' ? 500 : -1,
    },
    unlimited: {
      employees: tierConfig.max_employees === -1,
      projects: tierConfig.max_projects === -1,
      jtsas: tier === 'enterprise',
    },
  };
};

module.exports = {
  checkEmployeeLimit,
  checkProjectLimit,
  checkJtsaMonthlyLimit,
  getTierLimits,
};
