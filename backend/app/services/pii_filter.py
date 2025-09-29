"""
PII Filter Service - Local LLM for removing personal information
Uses Mistral 7B or similar model to strip PII and create abstract queries
"""

import asyncio
import logging
import re
from typing import Dict, List, Any
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
import json

logger = logging.getLogger(__name__)

class PIIFilterService:
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model_name = "mistralai/Mistral-7B-Instruct-v0.1"
        
        # PII patterns for additional rule-based filtering
        self.pii_patterns = {
            "names": r'\b[A-Z][a-z]+ [A-Z][a-z]+\b',
            "phone": r'\b\d{2,3}[-.\s]?\d{2,3}[-.\s]?\d{3,4}\b',
            "email": r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            "id_numbers": r'\b\d{8,12}\b',
            "addresses": r'\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd)\b'
        }
        
    async def initialize(self):
        """Initialize the local LLM for PII filtering"""
        try:
            logger.info(f"Loading PII filter model: {self.model_name}")
            
            # Configure quantization for efficiency
            quantization_config = BitsAndBytesConfig(
                load_in_4bit=True,
                bnb_4bit_compute_dtype=torch.float16,
                bnb_4bit_use_double_quant=True,
                bnb_4bit_quant_type="nf4"
            )
            
            # Load tokenizer
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.model_name,
                trust_remote_code=True
            )
            
            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token
            
            # Load model with quantization
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_name,
                quantization_config=quantization_config,
                device_map="auto",
                trust_remote_code=True,
                torch_dtype=torch.float16
            )
            
            logger.info("PII filter model loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize PII filter: {e}")
            raise
    
    async def strip_pii(self, query: str) -> Dict[str, Any]:
        """
        Remove PII from user query and create abstract version
        
        Args:
            query: Original user query with potential PII
            
        Returns:
            Dict containing abstract query and PII detection info
        """
        try:
            # Step 1: Rule-based PII detection and masking
            pii_detected = self._detect_pii_patterns(query)
            masked_query = self._mask_pii_patterns(query)
            
            # Step 2: LLM-based abstraction
            abstract_query = await self._create_abstract_query(masked_query)
            
            return {
                "abstract_query": abstract_query,
                "pii_detected": pii_detected,
                "masked_query": masked_query,
                "original_length": len(query),
                "abstract_length": len(abstract_query)
            }
            
        except Exception as e:
            logger.error(f"Error in PII filtering: {e}")
            # Fallback to rule-based filtering only
            return {
                "abstract_query": self._mask_pii_patterns(query),
                "pii_detected": self._detect_pii_patterns(query),
                "masked_query": self._mask_pii_patterns(query),
                "original_length": len(query),
                "abstract_length": len(self._mask_pii_patterns(query))
            }
    
    def _detect_pii_patterns(self, text: str) -> Dict[str, List[str]]:
        """Detect PII using regex patterns"""
        detected = {}
        
        for pii_type, pattern in self.pii_patterns.items():
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                detected[pii_type] = matches
                
        return detected
    
    def _mask_pii_patterns(self, text: str) -> str:
        """Mask detected PII with generic placeholders"""
        masked_text = text
        
        # Replace names
        masked_text = re.sub(self.pii_patterns["names"], "[PERSON_NAME]", masked_text)
        
        # Replace phone numbers
        masked_text = re.sub(self.pii_patterns["phone"], "[PHONE_NUMBER]", masked_text)
        
        # Replace emails
        masked_text = re.sub(self.pii_patterns["email"], "[EMAIL_ADDRESS]", masked_text)
        
        # Replace ID numbers
        masked_text = re.sub(self.pii_patterns["id_numbers"], "[ID_NUMBER]", masked_text)
        
        # Replace addresses
        masked_text = re.sub(self.pii_patterns["addresses"], "[ADDRESS]", masked_text)
        
        return masked_text
    
    async def _create_abstract_query(self, masked_query: str) -> str:
        """Use LLM to create abstract, generic version of the query"""
        if not self.model or not self.tokenizer:
            logger.warning("Model not initialized, using masked query as abstract")
            return masked_query
        
        try:
            # Create prompt for abstraction
            prompt = f"""<s>[INST] You are a privacy protection assistant. Your task is to convert specific legal queries into generic, abstract versions that remove all personal details while preserving the legal question.

Convert this query into a generic, abstract legal question:
"{masked_query}"

Rules:
1. Remove all personal identifiers, names, specific locations
2. Keep the core legal question intact
3. Use generic terms like "individual", "person", "business owner"
4. Maintain the legal context and intent
5. Respond only with the abstract query, no explanations

Abstract query: [/INST]"""

            # Tokenize and generate
            inputs = self.tokenizer(
                prompt,
                return_tensors="pt",
                truncation=True,
                max_length=512
            ).to(self.device)
            
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    max_new_tokens=150,
                    temperature=0.3,
                    do_sample=True,
                    pad_token_id=self.tokenizer.eos_token_id
                )
            
            # Decode response
            response = self.tokenizer.decode(
                outputs[0][inputs['input_ids'].shape[1]:],
                skip_special_tokens=True
            ).strip()
            
            # Clean up response
            abstract_query = self._clean_abstract_response(response)
            
            return abstract_query if abstract_query else masked_query
            
        except Exception as e:
            logger.error(f"Error in LLM abstraction: {e}")
            return masked_query
    
    def _clean_abstract_response(self, response: str) -> str:
        """Clean and validate the abstract query response"""
        # Remove common LLM artifacts
        response = response.replace("Abstract query:", "").strip()
        response = response.replace("Query:", "").strip()
        
        # Remove quotes if present
        if response.startswith('"') and response.endswith('"'):
            response = response[1:-1]
        
        # Ensure it's not empty and reasonable length
        if len(response) < 10 or len(response) > 500:
            return ""
        
        return response
    
    async def health_check(self) -> str:
        """Check if the PII filter service is healthy"""
        try:
            if self.model is None or self.tokenizer is None:
                return "unhealthy - model not loaded"
            
            # Test with a simple query
            test_result = await self.strip_pii("Test query for health check")
            
            if test_result and "abstract_query" in test_result:
                return "healthy"
            else:
                return "unhealthy - processing failed"
                
        except Exception as e:
            logger.error(f"PII filter health check failed: {e}")
            return f"unhealthy - {str(e)}"