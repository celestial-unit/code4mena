#!/usr/bin/env python3
"""
Database initialization script
Runs migrations and seeds initial data
"""

import asyncio
import logging
import sys
import os
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from backend.app.core.database import init_db
from backend.app.core.seed_data import seed_database

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


async def main():
    """Main initialization function"""
    try:
        logger.info("Initializing database...")
        
        # Create all tables
        await init_db()
        logger.info("Database tables created successfully")
        
        # Seed initial data
        await seed_database()
        logger.info("Database seeded successfully")
        
        logger.info("Database initialization completed!")
        
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())