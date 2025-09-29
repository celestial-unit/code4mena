"""
Mascot Service - Business logic for mascot management
"""

from typing import List, Optional, Dict, Any

from ..repositories.mascot_repository import MascotRepository

class MascotService:
    """Service class for mascot operations"""
    
    def __init__(self):
        self.repository = MascotRepository()
    
    async def get_mascots(
        self,
        sector: Optional[str] = None,
        language: str = "ar",
        include_locked: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Get available mascots
        """
        return await self.repository.get_mascots(
            sector=sector,
            language=language,
            include_locked=include_locked
        )
    
    async def get_mascot_by_id(
        self,
        mascot_id: str,
        language: str = "ar"
    ) -> Optional[Dict[str, Any]]:
        """
        Get a specific mascot by ID
        """
        return await self.repository.get_mascot_by_id(mascot_id, language=language)
    
    async def get_mascot_by_sector(
        self,
        sector: str,
        language: str = "ar"
    ) -> Optional[Dict[str, Any]]:
        """
        Get mascot for a specific sector
        """
        return await self.repository.get_mascot_by_sector(sector, language=language)
    
    async def get_mascot_animations(
        self,
        mascot_id: str,
        animation_type: Optional[str] = None,
        language: str = "ar"
    ) -> List[Dict[str, Any]]:
        """
        Get animations for a specific mascot
        """
        return await self.repository.get_mascot_animations(
            mascot_id=mascot_id,
            animation_type=animation_type,
            language=language
        )
    
    async def get_mascot_customizations(
        self,
        mascot_id: str,
        user_id: str,
        language: str = "ar"
    ) -> List[Dict[str, Any]]:
        """
        Get customizations for a specific mascot
        """
        return await self.repository.get_mascot_customizations(
            mascot_id=mascot_id,
            user_id=user_id,
            language=language
        )
    
    async def unlock_mascot(
        self,
        mascot_id: str,
        user_id: str
    ) -> Dict[str, Any]:
        """
        Unlock a mascot for the user
        """
        # Check if mascot exists
        mascot = await self.repository.get_mascot_by_id(mascot_id)
        if not mascot:
            raise ValueError("Mascot not found")
        
        # Check unlock requirements (achievements, points, etc.)
        unlock_requirements = mascot.get("unlockRequirements", {})
        user_meets_requirements = await self._check_unlock_requirements(user_id, unlock_requirements)
        
        if not user_meets_requirements:
            return {
                "success": False,
                "message": "User does not meet unlock requirements",
                "requirements": unlock_requirements
            }
        
        # Unlock the mascot
        await self.repository.unlock_mascot_for_user(mascot_id, user_id)
        
        return {
            "success": True,
            "message": "Mascot unlocked successfully",
            "mascot": mascot
        }
    
    async def unlock_customization(
        self,
        mascot_id: str,
        customization_id: str,
        user_id: str
    ) -> Dict[str, Any]:
        """
        Unlock a mascot customization for the user
        """
        # Check if customization exists
        customization = await self.repository.get_customization_by_id(mascot_id, customization_id)
        if not customization:
            raise ValueError("Customization not found")
        
        # Check unlock requirements
        unlock_requirements = customization.get("unlockRequirements", {})
        user_meets_requirements = await self._check_unlock_requirements(user_id, unlock_requirements)
        
        if not user_meets_requirements:
            return {
                "success": False,
                "message": "User does not meet unlock requirements",
                "requirements": unlock_requirements
            }
        
        # Unlock the customization
        await self.repository.unlock_customization_for_user(mascot_id, customization_id, user_id)
        
        return {
            "success": True,
            "message": "Customization unlocked successfully",
            "customization": customization
        }
    
    async def update_user_mascot_preferences(
        self,
        user_id: str,
        preferences: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Update user's mascot preferences
        """
        return await self.repository.update_user_mascot_preferences(user_id, preferences)
    
    async def get_user_mascot_preferences(
        self,
        user_id: str
    ) -> Dict[str, Any]:
        """
        Get user's mascot preferences
        """
        return await self.repository.get_user_mascot_preferences(user_id)
    
    async def get_cultural_elements(
        self,
        element_type: Optional[str] = None,
        region: Optional[str] = None,
        language: str = "ar"
    ) -> List[Dict[str, Any]]:
        """
        Get Tunisian cultural elements used in mascots
        """
        return await self.repository.get_cultural_elements(
            element_type=element_type,
            region=region,
            language=language
        )
    
    async def _check_unlock_requirements(
        self,
        user_id: str,
        requirements: Dict[str, Any]
    ) -> bool:
        """
        Check if user meets unlock requirements
        """
        # Mock implementation - in a real system, this would check user achievements, points, etc.
        required_points = requirements.get("points", 0)
        required_achievements = requirements.get("achievements", [])
        
        # For now, always return True (all mascots unlocked)
        # In a real implementation, this would check against user data
        return True