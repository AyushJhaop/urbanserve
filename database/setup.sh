#!/bin/bash

# UrbanServe Database Setup Script
# This script creates the database and runs the schema

echo "🏙️ UrbanServe Database Setup"
echo "================================"

# Database configuration
DB_NAME="urbanserve_db"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Creating database: $DB_NAME${NC}"

# Create database if it doesn't exist
psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -c "CREATE DATABASE $DB_NAME"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database created/verified${NC}"
else
    echo -e "${RED}✗ Failed to create database${NC}"
    exit 1
fi

echo -e "${YELLOW}Running schema migration...${NC}"

# Run schema
psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -f "$(dirname "$0")/schema.sql"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Schema applied successfully${NC}"
else
    echo -e "${RED}✗ Failed to apply schema${NC}"
    exit 1
fi

echo -e "${YELLOW}Seeding initial data...${NC}"

# Run seed data (if exists)
if [ -f "$(dirname "$0")/seeds/initial_data.sql" ]; then
    psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -f "$(dirname "$0")/seeds/initial_data.sql"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Seed data loaded${NC}"
    else
        echo -e "${RED}✗ Failed to load seed data${NC}"
    fi
fi

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✓ Database setup complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo "User: $DB_USER"
echo ""
echo "You can now start the backend server:"
echo "  cd backend && npm run dev"
