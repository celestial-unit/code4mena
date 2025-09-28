"""
Kanounji 2025 - Government Social Media Scraper
Revolutionary real-time legal intelligence from Tunisian government social media

CRITICAL MISSION: Government announcements often appear on social media 
BEFORE formal publication in JORT (Journal Officiel)
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import aiohttp
import json
from dataclasses import dataclass
import re
from bs4 import BeautifulSoup
import feedparser

logger = logging.getLogger(__name__)

@dataclass
class SocialMediaPost:
    platform: str
    account: str
    ministry: str
    content: str
    url: str
    timestamp: datetime
    engagement: Dict[str, int]
    legal_signals: List[str]
    language: str

class GovernmentSocialScraper:
    """
    Scrape all 20+ Tunisian government ministry social media accounts
    Focus on: Policy announcements, regulatory changes, new laws
    
    REVOLUTIONARY CAPABILITY: Detect legal changes before official publication!
    """
    
    def __init__(self):
        self.government_accounts = {
            'facebook': {
                'MinistereJustice.Tunisie': 'وزارة العدل',
                'MinistereInterieur.TN': 'وزارة الداخلية', 
                'PrimatureTunisie': 'رئاسة الحكومة',
                'MinistereDuCommerce': 'وزارة التجارة',
                'MinistereFinances.TN': 'وزارة المالية',
                'MinistereEducation.TN': 'وزارة التربية',
                'MinistereSante.TN': 'وزارة الصحة',
                'MinistereTransport.TN': 'وزارة النقل',
                'MinistereAgriculture.TN': 'وزارة الفلاحة',
                'MinistereTourisme.TN': 'وزارة السياحة',
                'MinistereEnergie.TN': 'وزارة الطاقة',
                'MinistereEnvironnement.TN': 'وزارة البيئة',
                'MinistereCulture.TN': 'وزارة الثقافة',
                'MinistereJeunesse.TN': 'وزارة الشباب والرياضة',
                'MinistereFemme.TN': 'وزارة المرأة والأسرة',
                'MinistereAffairesSociales.TN': 'وزارة الشؤون الاجتماعية',
                'MinistereDefense.TN': 'وزارة الدفاع الوطني',
                'MinistereAffairesEtrangeres.TN': 'وزارة الخارجية',
                'MinistereIndustrie.TN': 'وزارة الصناعة',
                'MinistereTechnologie.TN': 'وزارة تكنولوجيات الاتصال'
            },
            'twitter': {
                '@MinJusticeTN': 'وزارة العدل',
                '@MinInterTN': 'وزارة الداخلية',
                '@PrimatureTN': 'رئاسة الحكومة',
                '@MinCommerceTN': 'وزارة التجارة',
                '@MinFinancesTN': 'وزارة المالية',
                '@MinEducationTN': 'وزارة التربية',
                '@MinSanteTN': 'وزارة الصحة',
                '@MinTransportTN': 'وزارة النقل',
                '@MinAgricultureTN': 'وزارة الفلاحة',
                '@MinTourismeTN': 'وزارة السياحة'
            },
            'instagram': {
                'ministere_justice_tunisie': 'وزارة العدل',
                'primature_tunisie': 'رئاسة الحكومة',
                'ministere_sante_tn': 'وزارة الصحة',
                'ministere_tourisme_tn': 'وزارة السياحة',
                'ministere_culture_tn': 'وزارة الثقافة'
            }
        }
        
        # Legal signal detection keywords
        self.legal_keywords = {
            'ar': [
                'قانون جديد', 'مرسوم', 'قرار حكومي', 'تشريع', 'أمر حكومي',
                'البرلمان', 'مجلس النواب', 'وزارة العدل', 'المحكمة',
                'إجراءات قانونية', 'تعديل قانون', 'مشروع قانون', 'لائحة',
                'قرار وزاري', 'منشور', 'دورية', 'تعليمات', 'نص قانوني',
                'الرائد الرسمي', 'جريدة رسمية', 'نشر رسمي', 'إعلان رسمي'
            ],
            'fr': [
                'nouvelle loi', 'décret', 'décision gouvernementale', 'législation',
                'parlement', 'assemblée', 'ministère de la justice', 'tribunal',
                'procédures légales', 'modification de loi', 'projet de loi',
                'règlement', 'décision ministérielle', 'circulaire', 'instructions',
                'journal officiel', 'publication officielle', 'annonce officielle'
            ]
        }
        
        self.session = None
    
    async def initialize(self):
        """Initialize HTTP session for scraping"""
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30),
            headers={
                'User-Agent': 'Mozilla/5.0 (compatible; KanounjiBotLegal/1.0; +https://kanounji.tn/bot)'
            }
        )
    
    async def scrape_all_accounts(self) -> List[SocialMediaPost]:
        """
        PRIORITY: Government announcements often appear on social media 
        BEFORE formal publication in JORT
        
        Returns:
            List of social media posts with legal significance
        """
        if not self.session:
            await self.initialize()
        
        all_posts = []
        
        try:
            # Scrape Facebook pages
            facebook_posts = await self._scrape_facebook_accounts()
            all_posts.extend(facebook_posts)
            
            # Scrape Twitter accounts  
            twitter_posts = await self._scrape_twitter_accounts()
            all_posts.extend(twitter_posts)
            
            # Scrape Instagram accounts
            instagram_posts = await self._scrape_instagram_accounts()
            all_posts.extend(instagram_posts)
            
            # Filter for legal significance
            legal_posts = self._filter_legal_significance(all_posts)
            
            logger.info(f"Scraped {len(all_posts)} total posts, {len(legal_posts)} with legal significance")
            
            return legal_posts
            
        except Exception as e:
            logger.error(f"Error scraping government social media: {e}")
            return []
    
    async def _scrape_facebook_accounts(self) -> List[SocialMediaPost]:
        """Scrape Facebook government pages using Graph API and RSS feeds"""
        posts = []
        
        for account, ministry in self.government_accounts['facebook'].items():
            try:
                # Try RSS feed first (public, no API key needed)
                rss_url = f"https://www.facebook.com/feeds/page.php?id={account}&format=rss20"
                
                async with self.session.get(rss_url) as response:
                    if response.status == 200:
                        rss_content = await response.text()
                        feed = feedparser.parse(rss_content)
                        
                        for entry in feed.entries[:10]:  # Last 10 posts
                            post = SocialMediaPost(
                                platform='facebook',
                                account=account,
                                ministry=ministry,
                                content=entry.get('summary', ''),
                                url=entry.get('link', ''),
                                timestamp=datetime.now(),
                                engagement={'likes': 0, 'shares': 0, 'comments': 0},
                                legal_signals=self._detect_legal_signals(entry.get('summary', '')),
                                language=self._detect_language(entry.get('summary', ''))
                            )
                            posts.append(post)
                
                # Add delay to be respectful
                await asyncio.sleep(2)
                
            except Exception as e:
                logger.warning(f"Could not scrape Facebook account {account}: {e}")
                continue
        
        return posts
    
    async def _scrape_twitter_accounts(self) -> List[SocialMediaPost]:
        """Scrape Twitter government accounts using RSS feeds"""
        posts = []
        
        for account, ministry in self.government_accounts['twitter'].items():
            try:
                # Use nitter RSS (Twitter alternative)
                username = account.replace('@', '')
                rss_url = f"https://nitter.net/{username}/rss"
                
                async with self.session.get(rss_url) as response:
                    if response.status == 200:
                        rss_content = await response.text()
                        feed = feedparser.parse(rss_content)
                        
                        for entry in feed.entries[:20]:  # Last 20 tweets
                            post = SocialMediaPost(
                                platform='twitter',
                                account=account,
                                ministry=ministry,
                                content=entry.get('summary', ''),
                                url=entry.get('link', ''),
                                timestamp=datetime.now(),
                                engagement={'retweets': 0, 'likes': 0, 'replies': 0},
                                legal_signals=self._detect_legal_signals(entry.get('summary', '')),
                                language=self._detect_language(entry.get('summary', ''))
                            )
                            posts.append(post)
                
                await asyncio.sleep(1)
                
            except Exception as e:
                logger.warning(f"Could not scrape Twitter account {account}: {e}")
                continue
        
        return posts
    
    async def _scrape_instagram_accounts(self) -> List[SocialMediaPost]:
        """Scrape Instagram government accounts"""
        posts = []
        
        # Instagram scraping is more complex due to API restrictions
        # For now, we'll implement a placeholder that can be enhanced
        # with proper Instagram API access or web scraping tools
        
        logger.info("Instagram scraping placeholder - implement with proper API access")
        return posts
    
    def _detect_legal_signals(self, content: str) -> List[str]:
        """
        Detect legal significance in social media content
        
        Returns:
            List of detected legal signal types
        """
        signals = []
        content_lower = content.lower()
        
        # Check Arabic keywords
        for keyword in self.legal_keywords['ar']:
            if keyword in content_lower:
                signals.append(f"ar:{keyword}")
        
        # Check French keywords
        for keyword in self.legal_keywords['fr']:
            if keyword in content_lower:
                signals.append(f"fr:{keyword}")
        
        # Detect specific legal patterns
        if re.search(r'قانون\s+رقم\s+\d+', content):
            signals.append('law_number_reference')
        
        if re.search(r'مرسوم\s+رقم\s+\d+', content):
            signals.append('decree_number_reference')
        
        if re.search(r'loi\s+n°?\s*\d+', content, re.IGNORECASE):
            signals.append('law_number_reference_fr')
        
        return signals
    
    def _detect_language(self, content: str) -> str:
        """Detect content language"""
        # Simple language detection based on script
        arabic_chars = len(re.findall(r'[\u0600-\u06FF]', content))
        latin_chars = len(re.findall(r'[a-zA-Z]', content))
        
        if arabic_chars > latin_chars:
            return 'ar'
        elif latin_chars > 0:
            return 'fr'
        else:
            return 'unknown'
    
    def _filter_legal_significance(self, posts: List[SocialMediaPost]) -> List[SocialMediaPost]:
        """Filter posts that have legal significance"""
        return [post for post in posts if post.legal_signals]
    
    async def get_breaking_legal_news(self) -> List[SocialMediaPost]:
        """
        Get breaking legal news from the last 24 hours
        
        REVOLUTIONARY: Catch legal changes as they happen!
        """
        recent_posts = await self.scrape_all_accounts()
        
        # Filter for very recent posts with high legal significance
        breaking_news = []
        cutoff_time = datetime.now() - timedelta(hours=24)
        
        for post in recent_posts:
            if post.timestamp > cutoff_time and len(post.legal_signals) >= 2:
                breaking_news.append(post)
        
        # Sort by legal signal count (most significant first)
        breaking_news.sort(key=lambda x: len(x.legal_signals), reverse=True)
        
        return breaking_news[:10]  # Top 10 breaking legal news
    
    async def monitor_specific_ministry(self, ministry_name: str) -> List[SocialMediaPost]:
        """Monitor a specific ministry for legal announcements"""
        all_posts = await self.scrape_all_accounts()
        return [post for post in all_posts if ministry_name in post.ministry]
    
    async def cleanup(self):
        """Clean up resources"""
        if self.session:
            await self.session.close()
    
    async def health_check(self) -> str:
        """Check if the government social scraper is healthy"""
        try:
            if not self.session:
                return "unhealthy - session not initialized"
            
            # Test if we can access at least one ministry
            test_ministry = list(self.ministry_accounts.keys())[0]
            if test_ministry in self.ministry_accounts:
                return "healthy"
            else:
                return "unhealthy - no ministry accounts configured"
                
        except Exception as e:
            return f"unhealthy - {str(e)}"

# Background task for continuous monitoring
async def continuous_government_monitoring():
    """
    Run every 15 minutes to catch breaking legal news
    CRITICAL: Government announcements can happen at any time!
    """
    scraper = GovernmentSocialScraper()
    
    try:
        while True:
            logger.info("Starting government social media monitoring cycle...")
            
            # Scrape all accounts
            legal_posts = await scraper.scrape_all_accounts()
            
            # Process and store the posts (will be implemented in database service)
            if legal_posts:
                logger.info(f"Found {len(legal_posts)} posts with legal significance")
                # TODO: Store in database and trigger alerts
            
            # Wait 15 minutes before next cycle
            await asyncio.sleep(900)
            
    except Exception as e:
        logger.error(f"Error in continuous monitoring: {e}")
    finally:
        await scraper.cleanup()