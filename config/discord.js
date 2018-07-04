const production = {
  channel: {
    'mentor-help': '456267567095611392',
    'staff-help': '456267748658380812',
    stat: '455396418199486465'
  },
  role: {
    attendees: '455402838210773012',
    dev: '456539994719518750',
    illinois: '456228742386155520',
    ohio: '456228521992519700',
    organizers: ''
  },
  server: '455396418199486465'
}

const development = {
  channel: {
    stat: '463511563266162698'
  },
  role: {
    attendees: '463510844353806346',
    dev: '463525539232088077',
    illinois: '463511452016443392',
    ohio: '463511424405078038',
    organizers: '463510810539327501'
  },
  server: '458440699768078340'
}

module.exports =
  process.env.NODE_ENV === 'production' ? production : development
