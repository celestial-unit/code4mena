"""
Mascot Repository - Data access layer for mascot information
"""

from typing import List, Optional, Dict, Any
import copy

class MascotRepository:
    """Repository class for mascot data access"""
    
    def __init__(self):
        # Mock data based on the original mascots.json
        self._mock_mascots = [
            {
                "id": "mascot-business-001",
                "name": "Tijari",
                "nameAr": "تجاري",
                "nameFr": "Tijari",
                "sector": "business",
                "description": "A sophisticated business mascot wearing traditional Tunisian business attire with modern touches",
                "descriptionAr": "تميمة أعمال أنيقة ترتدي الزي التجاري التونسي التقليدي مع لمسات عصرية",
                "descriptionFr": "Une mascotte d'affaires sophistiquée portant une tenue d'affaires tunisienne traditionnelle avec des touches modernes",
                "isLocked": False,
                "unlockRequirements": {
                    "points": 0,
                    "achievements": []
                },
                "culturalElements": [
                    {
                        "id": "element-001",
                        "type": "clothing",
                        "name": "Traditional Jebba with Modern Cut",
                        "nameAr": "جبة تقليدية بقصة عصرية",
                        "nameFr": "Jebba traditionnelle avec coupe moderne",
                        "tunisianReference": "Jebba - Traditional Tunisian formal wear",
                        "tunisianReferenceAr": "الجبة - الزي الرسمي التونسي التقليدي",
                        "tunisianReferenceFr": "Jebba - Tenue formelle tunisienne traditionnelle",
                        "culturalSignificance": "Symbol of dignity and professionalism in Tunisian business culture",
                        "culturalSignificanceAr": "رمز الكرامة والمهنية في ثقافة الأعمال التونسية",
                        "culturalSignificanceFr": "Symbole de dignité et de professionnalisme dans la culture d'affaires tunisienne",
                        "visualRepresentation": "White jebba with gold embroidery and modern tailoring",
                        "region": "national",
                        "isTraditional": True,
                        "modernAdaptation": "Fitted cut suitable for contemporary business settings"
                    },
                    {
                        "id": "element-002",
                        "type": "accessories",
                        "name": "Chechia with Business Badge",
                        "nameAr": "شاشية مع شارة الأعمال",
                        "nameFr": "Chéchia avec badge d'affaires",
                        "tunisianReference": "Chechia - Traditional Tunisian red cap",
                        "tunisianReferenceAr": "الشاشية - القبعة الحمراء التونسية التقليدية",
                        "tunisianReferenceFr": "Chéchia - Bonnet rouge tunisien traditionnel",
                        "culturalSignificance": "National symbol of Tunisia, represents identity and pride",
                        "culturalSignificanceAr": "رمز وطني لتونس، يمثل الهوية والفخر",
                        "culturalSignificanceFr": "Symbole national de la Tunisie, représente l'identité et la fierté",
                        "visualRepresentation": "Red felt cap with small business-themed pin",
                        "region": "national",
                        "isTraditional": True,
                        "modernAdaptation": "Incorporates small modern business symbols"
                    }
                ],
                "animations": [
                    {
                        "id": "anim-001",
                        "name": "Professional Greeting",
                        "nameAr": "تحية مهنية",
                        "nameFr": "Salutation professionnelle",
                        "type": "greeting",
                        "duration": 2.5,
                        "description": "Formal business greeting with traditional Tunisian gestures",
                        "descriptionAr": "تحية عمل رسمية مع إيماءات تونسية تقليدية",
                        "descriptionFr": "Salutation d'affaires formelle avec des gestes tunisiens traditionnels",
                        "culturalElements": ["hand_to_heart", "slight_bow"],
                        "voiceSync": True,
                        "isUnlocked": True
                    },
                    {
                        "id": "anim-002",
                        "name": "Explaining Complex Concepts",
                        "nameAr": "شرح المفاهيم المعقدة",
                        "nameFr": "Explication de concepts complexes",
                        "type": "explaining",
                        "duration": 4.0,
                        "description": "Animated explanation with hand gestures and visual aids",
                        "descriptionAr": "شرح متحرك مع إيماءات اليد والوسائل البصرية",
                        "descriptionFr": "Explication animée avec des gestes de la main et des aides visuelles",
                        "culturalElements": ["expressive_hands", "thoughtful_pose"],
                        "voiceSync": True,
                        "isUnlocked": True
                    }
                ],
                "customizations": [
                    {
                        "id": "custom-001",
                        "name": "Gold Embroidery Pattern",
                        "nameAr": "نمط التطريز الذهبي",
                        "nameFr": "Motif de broderie dorée",
                        "type": "clothing_detail",
                        "description": "Traditional Tunisian gold embroidery patterns on the jebba",
                        "descriptionAr": "أنماط التطريز الذهبي التونسي التقليدي على الجبة",
                        "descriptionFr": "Motifs de broderie dorée tunisienne traditionnelle sur la jebba",
                        "isUnlocked": True,
                        "unlockRequirements": {
                            "points": 100,
                            "achievements": ["legal_explorer"]
                        },
                        "culturalReference": "Traditional Tunisian textile art",
                        "culturalReferenceAr": "فن النسيج التونسي التقليدي",
                        "culturalReferenceFr": "Art textile tunisien traditionnel"
                    }
                ]
            },
            {
                "id": "mascot-agriculture-001",
                "name": "Felahi",
                "nameAr": "فلاحي",
                "nameFr": "Felahi",
                "sector": "agriculture",
                "description": "A friendly agricultural mascot representing Tunisia's farming heritage",
                "descriptionAr": "تميمة زراعية ودودة تمثل التراث الزراعي التونسي",
                "descriptionFr": "Une mascotte agricole amicale représentant l'héritage agricole tunisien",
                "isLocked": False,
                "unlockRequirements": {
                    "points": 50,
                    "achievements": ["agriculture_interest"]
                },
                "culturalElements": [
                    {
                        "id": "element-003",
                        "type": "clothing",
                        "name": "Traditional Farmer Attire",
                        "nameAr": "زي الفلاح التقليدي",
                        "nameFr": "Tenue traditionnelle de fermier",
                        "tunisianReference": "Traditional Tunisian farmer clothing",
                        "tunisianReferenceAr": "ملابس الفلاح التونسي التقليدي",
                        "tunisianReferenceFr": "Vêtements traditionnels du fermier tunisien",
                        "culturalSignificance": "Represents the backbone of Tunisian economy and culture",
                        "culturalSignificanceAr": "يمثل العمود الفقري للاقتصاد والثقافة التونسية",
                        "culturalSignificanceFr": "Représente l'épine dorsale de l'économie et de la culture tunisiennes",
                        "visualRepresentation": "Simple, practical clothing suitable for farm work",
                        "region": "rural",
                        "isTraditional": True,
                        "modernAdaptation": "Updated with modern farming tools and techniques"
                    }
                ],
                "animations": [
                    {
                        "id": "anim-003",
                        "name": "Harvesting Celebration",
                        "nameAr": "احتفال الحصاد",
                        "nameFr": "Célébration de la récolte",
                        "type": "celebration",
                        "duration": 3.0,
                        "description": "Joyful celebration of successful harvest",
                        "descriptionAr": "احتفال مبهج بالحصاد الناجح",
                        "descriptionFr": "Célébration joyeuse d'une récolte réussie",
                        "culturalElements": ["traditional_dance", "harvest_tools"],
                        "voiceSync": True,
                        "isUnlocked": True
                    }
                ],
                "customizations": []
            }
        ]
        
        self._user_mascot_preferences = {}
    
    async def get_mascots(
        self,
        sector: Optional[str] = None,
        language: str = "ar",
        include_locked: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Get available mascots
        """
        mascots = copy.deepcopy(self._mock_mascots)
        
        # Filter by sector
        if sector:
            mascots = [m for m in mascots if m["sector"] == sector]
        
        # Filter locked mascots
        if not include_locked:
            mascots = [m for m in mascots if not m.get("isLocked", False)]
        
        return mascots
    
    async def get_mascot_by_id(
        self,
        mascot_id: str,
        language: str = "ar"
    ) -> Optional[Dict[str, Any]]:
        """
        Get a specific mascot by ID
        """
        for mascot in self._mock_mascots:
            if mascot["id"] == mascot_id:
                return copy.deepcopy(mascot)
        return None
    
    async def get_mascot_by_sector(
        self,
        sector: str,
        language: str = "ar"
    ) -> Optional[Dict[str, Any]]:
        """
        Get mascot for a specific sector
        """
        for mascot in self._mock_mascots:
            if mascot["sector"] == sector and not mascot.get("isLocked", False):
                return copy.deepcopy(mascot)
        return None
    
    async def get_mascot_animations(
        self,
        mascot_id: str,
        animation_type: Optional[str] = None,
        language: str = "ar"
    ) -> List[Dict[str, Any]]:
        """
        Get animations for a specific mascot
        """
        mascot = await self.get_mascot_by_id(mascot_id, language)
        if not mascot:
            return []
        
        animations = mascot.get("animations", [])
        
        # Filter by animation type
        if animation_type:
            animations = [a for a in animations if a["type"] == animation_type]
        
        return animations
    
    async def get_mascot_customizations(
        self,
        mascot_id: str,
        user_id: str,
        language: str = "ar"
    ) -> List[Dict[str, Any]]:
        """
        Get customizations for a specific mascot
        """
        mascot = await self.get_mascot_by_id(mascot_id, language)
        if not mascot:
            return []
        
        return mascot.get("customizations", [])
    
    async def get_customization_by_id(
        self,
        mascot_id: str,
        customization_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get a specific customization by ID
        """
        mascot = await self.get_mascot_by_id(mascot_id)
        if not mascot:
            return None
        
        for customization in mascot.get("customizations", []):
            if customization["id"] == customization_id:
                return copy.deepcopy(customization)
        return None
    
    async def unlock_mascot_for_user(self, mascot_id: str, user_id: str) -> None:
        """
        Unlock a mascot for the user
        """
        # In a real implementation, this would update user's unlocked mascots
        pass
    
    async def unlock_customization_for_user(
        self,
        mascot_id: str,
        customization_id: str,
        user_id: str
    ) -> None:
        """
        Unlock a customization for the user
        """
        # In a real implementation, this would update user's unlocked customizations
        pass
    
    async def update_user_mascot_preferences(
        self,
        user_id: str,
        preferences: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Update user's mascot preferences
        """
        self._user_mascot_preferences[user_id] = preferences
        return preferences
    
    async def get_user_mascot_preferences(
        self,
        user_id: str
    ) -> Dict[str, Any]:
        """
        Get user's mascot preferences
        """
        return self._user_mascot_preferences.get(user_id, {
            "enabled": True,
            "preferredSector": "business",
            "animationLevel": "full",
            "voiceSync": True,
            "celebrations": True,
            "customizations": []
        })
    
    async def get_cultural_elements(
        self,
        element_type: Optional[str] = None,
        region: Optional[str] = None,
        language: str = "ar"
    ) -> List[Dict[str, Any]]:
        """
        Get Tunisian cultural elements used in mascots
        """
        all_elements = []
        
        # Extract cultural elements from all mascots
        for mascot in self._mock_mascots:
            for element in mascot.get("culturalElements", []):
                all_elements.append(copy.deepcopy(element))
        
        # Filter by type
        if element_type:
            all_elements = [e for e in all_elements if e["type"] == element_type]
        
        # Filter by region
        if region:
            all_elements = [e for e in all_elements if e["region"] == region]
        
        return all_elements