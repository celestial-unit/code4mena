"""
User Repository - Data access layer for user information
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
import copy

class UserRepository:
    """Repository class for user data access"""
    
    def __init__(self):
        # Mock data based on the original users.json
        self._mock_users = [
            {
                "id": "user-001",
                "name": "Ahmed Ben Salem",
                "nameAr": "أحمد بن سالم",
                "email": "ahmed.bensalem@email.com",
                "phone": "+216 98 123 456",
                "avatar": "https://example.com/avatars/ahmed.jpg",
                "password_hash": "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",  # "password"
                "profile": {
                    "sectors": ["business", "technology", "money"],
                    "legalCategories": ["business_law", "tax_law", "commercial_law"],
                    "businessType": "llc",
                    "region": "tunis",
                    "language": "ar",
                    "experienceLevel": "intermediate",
                    "interests": ["startup regulations", "digital payments", "export laws"],
                    "interestsAr": ["لوائح الشركات الناشئة", "المدفوعات الرقمية", "قوانين التصدير"],
                    "interestsFr": ["réglementations startup", "paiements numériques", "lois d'exportation"],
                    "occupation": "Tech Entrepreneur",
                    "occupationAr": "رائد أعمال تقني",
                    "occupationFr": "Entrepreneur technologique",
                    "companySize": "small"
                },
                "preferences": {
                    "notifications": {
                        "pushNotifications": True,
                        "emailNotifications": True,
                        "smsNotifications": False,
                        "legalUpdates": True,
                        "achievements": True,
                        "reminders": True,
                        "governmentAlerts": True,
                        "parliamentaryUpdates": False,
                        "quietHours": {
                            "enabled": True,
                            "startTime": "22:00",
                            "endTime": "07:00"
                        },
                        "categories": {
                            "business_law": True,
                            "civil_law": False,
                            "administrative_law": True,
                            "labor_law": True,
                            "tax_law": True,
                            "family_law": False,
                            "criminal_law": False,
                            "constitutional_law": False,
                            "commercial_law": True,
                            "environmental_law": False
                        }
                    },
                    "privacy": {
                        "dataSharing": False,
                        "analytics": True,
                        "personalization": True,
                        "locationTracking": False,
                        "voiceRecording": True,
                        "communityFeatures": True,
                        "profileVisibility": "private"
                    },
                    "display": {
                        "theme": "light",
                        "fontSize": "medium",
                        "animations": True,
                        "reducedMotion": False,
                        "highContrast": False,
                        "rtlLayout": True,
                        "colorScheme": "default"
                    },
                    "language": "ar",
                    "mascot": {
                        "enabled": True,
                        "preferredSector": "business",
                        "animationLevel": "full",
                        "voiceSync": True,
                        "celebrations": True,
                        "customizations": []
                    },
                    "voice": {
                        "enabled": True,
                        "dialect": "tunis",
                        "voiceSpeed": 1.0,
                        "voiceGender": "male",
                        "noiseReduction": True,
                        "autoTranscription": True
                    }
                },
                "achievements": [
                    {
                        "id": "achievement-001",
                        "title": "Legal Explorer",
                        "titleAr": "مستكشف القانون",
                        "titleFr": "Explorateur juridique",
                        "description": "Read your first 10 legal updates",
                        "descriptionAr": "اقرأ أول 10 تحديثات قانونية",
                        "descriptionFr": "Lire vos 10 premières mises à jour juridiques",
                        "category": "exploration",
                        "icon": "🔍",
                        "rarity": "common",
                        "points": 100,
                        "unlockedAt": "2024-01-10T14:30:00Z",
                        "requirements": [
                            {
                                "type": "legal_updates_read",
                                "value": 10,
                                "description": "Read 10 legal updates",
                                "descriptionAr": "اقرأ 10 تحديثات قانونية",
                                "descriptionFr": "Lire 10 mises à jour juridiques"
                            }
                        ],
                        "rewards": [
                            {
                                "type": "mascot_unlock",
                                "value": "business-mascot-basic",
                                "description": "Unlock basic business mascot",
                                "descriptionAr": "فتح التميمة التجارية الأساسية",
                                "descriptionFr": "Débloquer la mascotte d'affaires de base"
                            }
                        ]
                    }
                ],
                "statistics": {
                    "totalLegalUpdatesRead": 25,
                    "totalChatConversations": 8,
                    "totalSearchQueries": 15,
                    "totalDaysActive": 12,
                    "currentStreak": 5,
                    "longestStreak": 7,
                    "totalAchievements": 3,
                    "totalPoints": 450,
                    "favoriteCategory": "business_law",
                    "mostActiveSector": "business",
                    "averageSessionDuration": 18.5,
                    "lastWeekActivity": [
                        {
                            "date": "2024-01-15T00:00:00Z",
                            "updatesRead": 3,
                            "chatMessages": 5,
                            "searchQueries": 2,
                            "timeSpent": 25
                        },
                        {
                            "date": "2024-01-14T00:00:00Z",
                            "updatesRead": 2,
                            "chatMessages": 0,
                            "searchQueries": 1,
                            "timeSpent": 12
                        }
                    ],
                    "monthlyStats": [
                        {
                            "month": "January",
                            "year": 2024,
                            "updatesRead": 25,
                            "chatConversations": 8,
                            "searchQueries": 15,
                            "achievementsUnlocked": 3,
                            "totalTimeSpent": 320
                        }
                    ]
                },
                "createdAt": "2024-01-01T10:00:00Z",
                "lastActiveAt": "2024-01-15T16:45:00Z",
                "isVerified": True,
                "is_admin": False
            },
            {
                "id": "user-002",
                "name": "Fatma Trabelsi",
                "nameAr": "فاطمة الطرابلسي",
                "email": "fatma.trabelsi@email.com",
                "phone": "+216 97 654 321",
                "avatar": "https://example.com/avatars/fatma.jpg",
                "password_hash": "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",  # "password"
                "profile": {
                    "sectors": ["agriculture", "food", "education"],
                    "legalCategories": ["administrative_law", "environmental_law", "family_law"],
                    "businessType": "cooperative",
                    "region": "sfax",
                    "language": "fr",
                    "experienceLevel": "beginner",
                    "interests": ["organic farming", "food safety", "cooperative law"],
                    "interestsAr": ["الزراعة العضوية", "سلامة الغذاء", "قانون التعاونيات"],
                    "interestsFr": ["agriculture biologique", "sécurité alimentaire", "droit coopératif"],
                    "occupation": "Agricultural Cooperative Manager",
                    "occupationAr": "مديرة تعاونية زراعية",
                    "occupationFr": "Gestionnaire de coopérative agricole",
                    "companySize": "medium"
                },
                "preferences": {
                    "notifications": {
                        "pushNotifications": True,
                        "emailNotifications": True,
                        "smsNotifications": True,
                        "legalUpdates": True,
                        "achievements": True,
                        "reminders": True,
                        "governmentAlerts": True,
                        "parliamentaryUpdates": True,
                        "quietHours": {
                            "enabled": False,
                            "startTime": "23:00",
                            "endTime": "06:00"
                        },
                        "categories": {
                            "business_law": False,
                            "civil_law": True,
                            "administrative_law": True,
                            "labor_law": True,
                            "tax_law": False,
                            "family_law": True,
                            "criminal_law": False,
                            "constitutional_law": False,
                            "commercial_law": False,
                            "environmental_law": True
                        }
                    },
                    "privacy": {
                        "dataSharing": True,
                        "analytics": True,
                        "personalization": True,
                        "locationTracking": True,
                        "voiceRecording": False,
                        "communityFeatures": True,
                        "profileVisibility": "public"
                    },
                    "display": {
                        "theme": "auto",
                        "fontSize": "large",
                        "animations": True,
                        "reducedMotion": False,
                        "highContrast": False,
                        "rtlLayout": False,
                        "colorScheme": "default"
                    },
                    "language": "fr",
                    "mascot": {
                        "enabled": True,
                        "preferredSector": "agriculture",
                        "animationLevel": "reduced",
                        "voiceSync": False,
                        "celebrations": True,
                        "customizations": []
                    },
                    "voice": {
                        "enabled": False,
                        "dialect": "sfax",
                        "voiceSpeed": 0.9,
                        "voiceGender": "female",
                        "noiseReduction": True,
                        "autoTranscription": False
                    }
                },
                "achievements": [
                    {
                        "id": "achievement-002",
                        "title": "Community Helper",
                        "titleAr": "مساعد المجتمع",
                        "titleFr": "Assistant communautaire",
                        "description": "Help 5 community members with legal questions",
                        "descriptionAr": "ساعد 5 أعضاء من المجتمع بأسئلة قانونية",
                        "descriptionFr": "Aider 5 membres de la communauté avec des questions juridiques",
                        "category": "community",
                        "icon": "🤝",
                        "rarity": "uncommon",
                        "points": 200,
                        "unlockedAt": "2024-01-08T11:20:00Z",
                        "requirements": [
                            {
                                "type": "chat_conversations",
                                "value": 5,
                                "description": "Complete 5 helpful conversations",
                                "descriptionAr": "أكمل 5 محادثات مفيدة",
                                "descriptionFr": "Compléter 5 conversations utiles"
                            }
                        ],
                        "rewards": [
                            {
                                "type": "mascot_unlock",
                                "value": "agriculture-mascot-helper",
                                "description": "Unlock helpful agriculture mascot",
                                "descriptionAr": "فتح تميمة زراعية مفيدة",
                                "descriptionFr": "Débloquer la mascotte agricole utile"
                            }
                        ]
                    }
                ],
                "statistics": {
                    "totalLegalUpdatesRead": 18,
                    "totalChatConversations": 12,
                    "totalSearchQueries": 8,
                    "totalDaysActive": 15,
                    "currentStreak": 3,
                    "longestStreak": 8,
                    "totalAchievements": 2,
                    "totalPoints": 350,
                    "favoriteCategory": "administrative_law",
                    "mostActiveSector": "agriculture",
                    "averageSessionDuration": 22.3,
                    "lastWeekActivity": [
                        {
                            "date": "2024-01-15T00:00:00Z",
                            "updatesRead": 2,
                            "chatMessages": 8,
                            "searchQueries": 1,
                            "timeSpent": 35
                        },
                        {
                            "date": "2024-01-14T00:00:00Z",
                            "updatesRead": 1,
                            "chatMessages": 3,
                            "searchQueries": 0,
                            "timeSpent": 18
                        }
                    ],
                    "monthlyStats": [
                        {
                            "month": "January",
                            "year": 2024,
                            "updatesRead": 18,
                            "chatConversations": 12,
                            "searchQueries": 8,
                            "achievementsUnlocked": 2,
                            "totalTimeSpent": 445
                        }
                    ]
                },
                "createdAt": "2023-12-28T09:15:00Z",
                "lastActiveAt": "2024-01-15T13:22:00Z",
                "isVerified": True,
                "is_admin": False
            }
        ]
    
    async def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new user
        """
        user = copy.deepcopy(user_data)
        self._mock_users.append(user)
        return user
    
    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Get user by ID
        """
        for user in self._mock_users:
            if user["id"] == user_id:
                return copy.deepcopy(user)
        return None
    
    async def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """
        Get user by email
        """
        for user in self._mock_users:
            if user["email"] == email:
                return copy.deepcopy(user)
        return None
    
    async def update_user_profile(self, user_id: str, profile_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Update user profile
        """
        for i, user in enumerate(self._mock_users):
            if user["id"] == user_id:
                # Update profile fields
                for key, value in profile_data.items():
                    if key in ["name", "nameAr", "phone", "avatar", "profile"]:
                        self._mock_users[i][key] = value
                
                self._mock_users[i]["lastActiveAt"] = datetime.utcnow().isoformat()
                return copy.deepcopy(self._mock_users[i])
        return None
    
    async def update_user_preferences(self, user_id: str, preferences: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Update user preferences
        """
        for i, user in enumerate(self._mock_users):
            if user["id"] == user_id:
                # Deep merge preferences
                self._deep_merge(self._mock_users[i]["preferences"], preferences)
                self._mock_users[i]["lastActiveAt"] = datetime.utcnow().isoformat()
                return copy.deepcopy(self._mock_users[i])
        return None
    
    async def update_last_active(self, user_id: str) -> None:
        """
        Update user's last active timestamp
        """
        for i, user in enumerate(self._mock_users):
            if user["id"] == user_id:
                self._mock_users[i]["lastActiveAt"] = datetime.utcnow().isoformat()
                break
    
    async def get_users(self, page: int = 1, limit: int = 10) -> Dict[str, Any]:
        """
        Get users with pagination
        """
        start_index = (page - 1) * limit
        end_index = start_index + limit
        
        users = copy.deepcopy(self._mock_users[start_index:end_index])
        
        return {
            "items": users,
            "totalItems": len(self._mock_users),
            "currentPage": page,
            "totalPages": (len(self._mock_users) + limit - 1) // limit,
            "pageSize": limit,
            "hasNextPage": end_index < len(self._mock_users),
            "hasPreviousPage": page > 1
        }
    
    async def get_user_statistics(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Get user statistics
        """
        user = await self.get_user_by_id(user_id)
        if user:
            return user.get("statistics", {})
        return None
    
    def _deep_merge(self, target: Dict[str, Any], source: Dict[str, Any]) -> None:
        """
        Deep merge source dictionary into target dictionary
        """
        for key, value in source.items():
            if key in target and isinstance(target[key], dict) and isinstance(value, dict):
                self._deep_merge(target[key], value)
            else:
                target[key] = value