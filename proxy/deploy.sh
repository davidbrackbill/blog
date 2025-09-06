#!/bin/bash

# This deploys the Vercel serverless proxy that can be used for 
# internal pages to fetch from external APIs, circumventing 
# CORS limitations.

set -e

if [ -f ".env.local" ]; then
    
    # Read all key=value pairs from .env.local
    while IFS='=' read -r key value; do
        # Skip empty lines and comments
        [[ -z "$key" || "$key" =~ ^[[:space:]]*# ]] && continue
        
        # Remove quotes from value if present
        value=$(echo "$value" | sed 's/^"//;s/"$//')
        
        # Get current value from Vercel (if exists)
        VERCEL_VALUE=$(vercel env ls | grep "^$key" | awk '{print $3}' || echo "")
        
        if [ -z "$VERCEL_VALUE" ]; then
            echo "$value" | vercel env add "$key" production
        elif [ "$VERCEL_VALUE" != "$value" ]; then
            vercel env rm "$key" production --yes
            echo "$value" | vercel env add "$key" production
        fi
    done < .env.local
else
    echo "❌ .env.local file not found!"
    exit 1
fi

vercel --prod
