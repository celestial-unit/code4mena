"""
Database seeding script for initial data
"""

import asyncio
import logging
from datetime import datetime
from typing import List
from uuid import uuid4

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.app.core.database import AsyncSessionLocal
from backend.app.models.legal import LegalCategory, LegalDocument
from backend.app.models.chat import ChatTemplate, MessageRole, MessageType
from backend.app.models.user import User, UserPreferences

logger = logging.getLogger(__name__)


async def create_legal_categories(db: AsyncSession) -> List[LegalCategory]:
    """Create initial legal categories"""
    categories_data = [
        {
            "name": "Commercial Law",
            "name_ar": "القانون التجاري",
            "name_fr": "Droit Commercial",
            "name_en": "Commercial Law",
            "code": "COMM",
            "description": "Laws governing commercial activities and business transactions",
            "description_ar": "القوانين التي تحكم الأنشطة التجارية والمعاملات التجارية",
            "description_fr": "Lois régissant les activités commerciales et les transactions commerciales",
            "description_en": "Laws governing commercial activities and business transactions",
        },
        {
            "name": "Maritime Law",
            "name_ar": "القانون البحري",
            "name_fr": "Droit Maritime",
            "name_en": "Maritime Law",
            "code": "MAR",
            "description": "Laws governing maritime activities and shipping",
            "description_ar": "القوانين التي تحكم الأنشطة البحرية والشحن",
            "description_fr": "Lois régissant les activités maritimes et le transport maritime",
            "description_en": "Laws governing maritime activities and shipping",
        },
        {
            "name": "Local Government",
            "name_ar": "الجماعات المحلية",
            "name_fr": "Collectivités Locales",
            "name_en": "Local Government",
            "code": "LOCAL",
            "description": "Laws governing local government and municipal affairs",
            "description_ar": "القوانين التي تحكم الحكومة المحلية والشؤون البلدية",
            "description_fr": "Lois régissant les collectivités locales et les affaires municipales",
            "description_en": "Laws governing local government and municipal affairs",
        },
        {
            "name": "Customs Law",
            "name_ar": "قانون الديوانة",
            "name_fr": "Droit Douanier",
            "name_en": "Customs Law",
            "code": "CUST",
            "description": "Laws governing customs and import/export regulations",
            "description_ar": "القوانين التي تحكم الجمارك ولوائح الاستيراد والتصدير",
            "description_fr": "Lois régissant les douanes et les réglementations d'import/export",
            "description_en": "Laws governing customs and import/export regulations",
        },
        {
            "name": "Constitutional Law",
            "name_ar": "القانون الدستوري",
            "name_fr": "Droit Constitutionnel",
            "name_en": "Constitutional Law",
            "code": "CONST",
            "description": "Constitutional provisions and fundamental laws",
            "description_ar": "الأحكام الدستورية والقوانين الأساسية",
            "description_fr": "Dispositions constitutionnelles et lois fondamentales",
            "description_en": "Constitutional provisions and fundamental laws",
        }
    ]
    
    categories = []
    for cat_data in categories_data:
        # Check if category already exists
        result = await db.execute(
            select(LegalCategory).where(LegalCategory.code == cat_data["code"])
        )
        existing = result.scalar_one_or_none()
        
        if not existing:
            category = LegalCategory(**cat_data)
            db.add(category)
            categories.append(category)
            logger.info(f"Created legal category: {cat_data['name']}")
    
    await db.commit()
    return categories


async def create_chat_templates(db: AsyncSession) -> List[ChatTemplate]:
    """Create initial chat templates"""
    templates_data = [
        {
            "name": "Legal Question",
            "name_ar": "سؤال قانوني",
            "name_fr": "Question Juridique",
            "name_en": "Legal Question",
            "description": "Template for asking general legal questions",
            "description_ar": "قالب لطرح الأسئلة القانونية العامة",
            "description_fr": "Modèle pour poser des questions juridiques générales",
            "description_en": "Template for asking general legal questions",
            "category": "general",
            "language": "ar",
            "initial_messages": [
                {
                    "role": "assistant",
                    "content": "مرحباً! أنا مساعدك القانوني الذكي. كيف يمكنني مساعدتك اليوم؟",
                    "content_ar": "مرحباً! أنا مساعدك القانوني الذكي. كيف يمكنني مساعدتك اليوم؟",
                    "content_en": "Hello! I'm your intelligent legal assistant. How can I help you today?",
                    "content_fr": "Bonjour! Je suis votre assistant juridique intelligent. Comment puis-je vous aider aujourd'hui?",
                    "message_type": "text"
                }
            ],
            "suggested_responses": [
                "لدي سؤال حول القانون التجاري",
                "أريد معرفة المزيد عن القانون البحري",
                "ما هي حقوقي كمواطن؟",
                "كيف يمكنني تأسيس شركة؟"
            ],
            "tags": ["general", "legal", "questions"],
            "difficulty_level": "beginner",
            "estimated_duration": 10,
        },
        {
            "name": "Commercial Law Consultation",
            "name_ar": "استشارة القانون التجاري",
            "name_fr": "Consultation Droit Commercial",
            "name_en": "Commercial Law Consultation",
            "description": "Template for commercial law related questions",
            "description_ar": "قالب للأسئلة المتعلقة بالقانون التجاري",
            "description_fr": "Modèle pour les questions liées au droit commercial",
            "description_en": "Template for commercial law related questions",
            "category": "commercial",
            "language": "ar",
            "initial_messages": [
                {
                    "role": "assistant",
                    "content": "أهلاً بك في قسم استشارات القانون التجاري. أنا هنا لمساعدتك في جميع الأمور المتعلقة بالقانون التجاري التونسي.",
                    "content_ar": "أهلاً بك في قسم استشارات القانون التجاري. أنا هنا لمساعدتك في جميع الأمور المتعلقة بالقانون التجاري التونسي.",
                    "content_en": "Welcome to the commercial law consultation section. I'm here to help you with all matters related to Tunisian commercial law.",
                    "content_fr": "Bienvenue dans la section consultation en droit commercial. Je suis là pour vous aider avec toutes les questions liées au droit commercial tunisien.",
                    "message_type": "text"
                }
            ],
            "suggested_responses": [
                "كيف يمكنني تسجيل شركة جديدة؟",
                "ما هي التزامات التاجر؟",
                "أريد معرفة المزيد عن عقود البيع التجارية",
                "ما هي إجراءات الإفلاس؟"
            ],
            "tags": ["commercial", "business", "company"],
            "difficulty_level": "intermediate",
            "estimated_duration": 15,
        },
        {
            "name": "Document Search",
            "name_ar": "البحث في الوثائق",
            "name_fr": "Recherche de Documents",
            "name_en": "Document Search",
            "description": "Template for searching legal documents",
            "description_ar": "قالب للبحث في الوثائق القانونية",
            "description_fr": "Modèle pour rechercher des documents juridiques",
            "description_en": "Template for searching legal documents",
            "category": "search",
            "language": "ar",
            "initial_messages": [
                {
                    "role": "assistant",
                    "content": "مرحباً! يمكنني مساعدتك في البحث عن الوثائق والنصوص القانونية. ما الذي تبحث عنه؟",
                    "content_ar": "مرحباً! يمكنني مساعدتك في البحث عن الوثائق والنصوص القانونية. ما الذي تبحث عنه؟",
                    "content_en": "Hello! I can help you search for legal documents and texts. What are you looking for?",
                    "content_fr": "Bonjour! Je peux vous aider à rechercher des documents et textes juridiques. Que cherchez-vous?",
                    "message_type": "text"
                }
            ],
            "suggested_responses": [
                "أبحث عن مواد في المجلة التجارية",
                "أريد العثور على قوانين الجمارك",
                "هل يمكنك العثور على نصوص حول الشركات؟",
                "أبحث عن القوانين البحرية"
            ],
            "tags": ["search", "documents", "legal-texts"],
            "difficulty_level": "beginner",
            "estimated_duration": 5,
        }
    ]
    
    templates = []
    for template_data in templates_data:
        # Check if template already exists
        result = await db.execute(
            select(ChatTemplate).where(
                ChatTemplate.name_ar == template_data["name_ar"]
            )
        )
        existing = result.scalar_one_or_none()
        
        if not existing:
            template = ChatTemplate(**template_data)
            db.add(template)
            templates.append(template)
            logger.info(f"Created chat template: {template_data['name']}")
    
    await db.commit()
    return templates


async def create_admin_user(db: AsyncSession) -> User:
    """Create initial admin user"""
    from passlib.context import CryptContext
    
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    # Check if admin user already exists
    result = await db.execute(
        select(User).where(User.username == "admin")
    )
    existing_admin = result.scalar_one_or_none()
    
    if not existing_admin:
        admin_user = User(
            email="admin@kanounji.tn",
            username="admin",
            hashed_password=pwd_context.hash("admin123"),  # Change this in production!
            full_name="System Administrator",
            preferred_language="ar",
            is_active=True,
            is_verified=True,
            is_superuser=True
        )
        
        db.add(admin_user)
        await db.commit()
        await db.refresh(admin_user)
        
        # Create preferences for admin user
        admin_preferences = UserPreferences(
            user_id=admin_user.id,
            email_notifications=True,
            push_notifications=True,
            legal_updates=True,
            theme="light",
            font_size="medium",
            data_collection_consent=True,
            analytics_consent=True
        )
        
        db.add(admin_preferences)
        await db.commit()
        
        logger.info("Created admin user with default preferences")
        return admin_user
    
    return existing_admin


async def seed_database():
    """Main function to seed the database with initial data"""
    logger.info("Starting database seeding...")
    
    async with AsyncSessionLocal() as db:
        try:
            # Create legal categories
            categories = await create_legal_categories(db)
            logger.info(f"Created {len(categories)} legal categories")
            
            # Create chat templates
            templates = await create_chat_templates(db)
            logger.info(f"Created {len(templates)} chat templates")
            
            # Create admin user
            admin_user = await create_admin_user(db)
            logger.info(f"Admin user ready: {admin_user.username}")
            
            logger.info("Database seeding completed successfully!")
            
        except Exception as e:
            logger.error(f"Error during database seeding: {e}")
            await db.rollback()
            raise


if __name__ == "__main__":
    # Run seeding script
    asyncio.run(seed_database())