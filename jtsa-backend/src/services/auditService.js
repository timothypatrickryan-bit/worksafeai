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
  } catch (error) {
    console.error('Audit log error:', error);
    // Don't throw - logging shouldn't break the request
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
