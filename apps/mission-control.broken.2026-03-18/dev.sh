#!/bin/bash
# Override NODE_ENV for development
unset NODE_ENV
export NODE_ENV=development
npm run dev "$@"
