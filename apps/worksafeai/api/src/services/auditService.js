// Audit logging service for compliance

const logAction = async (supabase, {
  companyId,
  userId,
  action,
  resourceType,
  resourceId,
  dataChanged,
  ipAddress,
}) => {
  try {
    // Validate required fields
    if (!companyId || !userId || !action || !resourceType) {
      console.error('Audit log missing required fields:', { companyId, userId, action, resourceType });
      return false;
    }
    
    await supabase
      .from('audit_logs')
      .insert({
        company_id: companyId,
        user_id: userId,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        data_changed: dataChanged,
        ip_address: ipAddress,
        timestamp: new Date(),
      });
    
    return true;
  } catch (error) {
    console.error('Audit log error:', {
      action,
      companyId,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    // Don't throw - logging shouldn't break the request, but do log the failure
    return false;
  }
};

// Middleware to extract IP address
const getClientIp = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0] ||
         req.headers['x-real-ip'] ||
         req.connection.remoteAddress ||
         'unknown';
};

module.exports = {
  logAction,
  getClientIp,
};
