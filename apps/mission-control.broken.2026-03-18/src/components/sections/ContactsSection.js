const ContactsSection = ({ state }) => {
  const contacts = state?.contacts || [];

  if (!contacts || contacts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary text-lg">No contacts configured</p>
      </div>
    );
  }

  const getChannelColor = (channel) => {
    const colors = {
      telegram: 'bg-blue-100 text-blue-700',
      email: 'bg-gray-100 text-gray-700',
      slack: 'bg-purple-100 text-purple-700',
      discord: 'bg-indigo-100 text-indigo-700',
      phone: 'bg-green-100 text-green-700',
    };
    return colors[channel] || 'bg-gray-100 text-gray-700';
  };

  const getChannelIcon = (channel) => {
    const icons = {
      telegram: '✈️',
      email: '📧',
      slack: '💬',
      discord: '🎮',
      phone: '📞',
    };
    return icons[channel] || '📱';
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-dark mb-6">👥 Contacts</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-dark">{contact.name}</h3>
              {contact.role && <p className="text-sm text-secondary">{contact.role}</p>}
            </div>

            {/* Channels */}
            {contact.channels && contact.channels.length > 0 && (
              <div className="space-y-2 mb-4">
                {contact.channels.map((ch, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-md"
                  >
                    <span className="text-lg">{getChannelIcon(ch.type)}</span>
                    <div className="flex-1">
                      <p className="text-xs text-secondary uppercase font-medium">
                        {ch.type}
                      </p>
                      <p className="text-sm text-dark font-mono">{ch.address}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded whitespace-nowrap ${getChannelColor(
                        ch.type
                      )}`}
                    >
                      {ch.type}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Contact Info */}
            {contact.details && (
              <div className="text-sm space-y-1 border-t border-gray-200 pt-4">
                {contact.details.timezone && (
                  <p>
                    <span className="text-secondary">Timezone:</span>{' '}
                    <span className="text-dark font-medium">{contact.details.timezone}</span>
                  </p>
                )}
                {contact.details.availability && (
                  <p>
                    <span className="text-secondary">Availability:</span>{' '}
                    <span className="text-dark font-medium">
                      {contact.details.availability}
                    </span>
                  </p>
                )}
                {contact.details.notes && (
                  <p className="text-secondary italic pt-2">{contact.details.notes}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactsSection;
