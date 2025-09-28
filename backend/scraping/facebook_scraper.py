"""
Facebook Scraper for Tunisian Government Pages
Scrapes public Facebook pages of Tunisian ministries for legal announcements

REVOLUTIONARY: Real-time government social media monitoring
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import aiohttp
from bs4 import BeautifulSoup
import json
import re
from urllib.parse import quote, urljoin
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class FacebookPost:
    page_name: str
    ministry: str
    post_id: str
    content: str
    post_url: str
    published_date: Optional[datetime]
    engagement: Dict[str, int]  # likes, shares, comments
    post_type: str  # text, photo, video, link
    legal_relevance: float
    legal_keywords: List[str]

class FacebookScraper:
    """
    Facebook scraper for Tunisian government pages
    Uses public access methods to scrape government social media
    """
    
    def __init__(self):
        self.session = None
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'ar,fr,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive'
        }
        
        # Real Tunisian government Facebook pages
        self.government_pages = {
            "وزارة العدل": {
                "page_id": "MinistereJustice.Tunisie",
                "page_name": "Ministère de la Justice Tunisie",
                "url": "https://www.facebook.com/MinistereJustice.Tunisie"
            },
            "وزارة الداخلية": {
                "page_id": "MinistereInterieur.TN",
                "page_name": "Ministère de l'Intérieur",
                "url": "https://www.facebook.com/MinistereInterieur.TN"
            },
            "رئاسة الحكومة": {
                "page_id": "PrimatureTunisie",
                "page_name": "Primature Tunisie",
                "url": "https://www.facebook.com/PrimatureTunisie"
            },
            "وزارة التجارة": {
                "page_id": "MinistereDuCommerce",
                "page_name": "Ministère du Commerce",
                "url": "https://www.facebook.com/MinistereDuCommerce"
            },
            "وزارة المالية": {
                "page_id": "MinistereFinances.TN",
                "page_name": "Ministère des Finances",
                "url": "https://www.facebook.com/MinistereFinances.TN"
            },
            "وزارة الصحة": {
                "page_id": "MinisteredelaSanteTunisie",
                "page_name": "Ministère de la Santé",
                "url": "https://www.facebook.com/MinisteredelaSanteTunisie"
            },
            "وزارة التربية": {
                "page_id": "MinistereEducation.TN",
                "page_name": "Ministère de l'Éducation",
                "url": "https://www.facebook.com/MinistereEducation.TN"
            },
            "وزارة النقل": {
                "page_id": "MinistereTransport.TN",
                "page_name": "Ministère du Transport",
                "url": "https://www.facebook.com/MinistereTransport.TN"
            },
            "وزارة الفلاحة": {
                "page_id": "MinistereAgriculture.TN",
                "page_name": "Ministère de l'Agriculture",
                "url": "https://www.facebook.com/MinistereAgriculture.TN"
            },
            "وزارة الطاقة": {
                "page_id": "MinistereEnergie.TN",
                "page_name": "Ministère de l'Énergie",
                "url": "https://www.facebook.com/MinistereEnergie.TN"
            }
        }
        
        # Legal keywords for relevance scoring
        self.legal_keywords = [
            # Arabic
            'قانون', 'مرسوم', 'أمر', 'قرار', 'منشور', 'تشريع', 'لائحة',
            'محكمة', 'قضاء', 'عدالة', 'حكم', 'دستور', 'برلمان',
            'شركة', 'تجارة', 'استثمار', 'ضريبة', 'رخصة', 'ترخيص',
            'عمل', 'عامل', 'أجر', 'تأمين', 'ضمان', 'حقوق',
            'صحة', 'دواء', 'مستشفى', 'علاج', 'وقاية',
            'تعليم', 'جامعة', 'شهادة', 'امتحان',
            'نقل', 'طريق', 'رخصة سياقة', 'مواصلات',
            'بيئة', 'تلوث', 'نظافة', 'طاقة',
            
            # French
            'loi', 'décret', 'arrêté', 'décision', 'circulaire',
            'tribunal', 'justice', 'jugement', 'constitution',
            'entreprise', 'commerce', 'investissement', 'taxe',
            'travail', 'employé', 'salaire', 'assurance',
            'santé', 'médecine', 'hôpital', 'traitement',
            'éducation', 'université', 'diplôme',
            'transport', 'route', 'permis',
            'environnement', 'pollution', 'énergie'
        ]
    
    async def initialize(self):
        """Initialize the Facebook scraper"""
        try:
            connector = aiohttp.TCPConnector(
                limit=5,
                limit_per_host=2,
                ttl_dns_cache=300,
                use_dns_cache=True
            )
            
            timeout = aiohttp.ClientTimeout(total=30, connect=10)
            
            self.session = aiohttp.ClientSession(
                headers=self.headers,
                connector=connector,
                timeout=timeout
            )
            
            logger.info("Facebook scraper initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error initializing Facebook scraper: {e}")
            return False
    
    async def scrape_facebook_page(self, ministry: str, page_info: Dict[str, str]) -> List[FacebookPost]:
        """
        Scrape a Facebook page for recent posts
        
        Args:
            ministry: Ministry name in Arabic
            page_info: Page information
            
        Returns:
            List of Facebook posts
        """
        posts = []
        
        try:
            if not self.session:
                await self.initialize()
            
            page_url = page_info['url']
            logger.info(f"Scraping Facebook page: {page_url}")
            
            # Method 1: Try to access mobile Facebook (less JavaScript)
            mobile_url = page_url.replace('www.facebook.com', 'm.facebook.com')
            
            async with self.session.get(mobile_url) as response:
                if response.status == 200:
                    html = await response.text()
                    soup = BeautifulSoup(html, 'html.parser')
                    
                    # Extract posts from mobile Facebook
                    page_posts = self._extract_mobile_facebook_posts(soup, ministry, page_info)
                    posts.extend(page_posts)
                
                else:
                    logger.warning(f"Failed to access {mobile_url}: HTTP {response.status}")
            
            # Method 2: Try RSS feed if available
            rss_url = f"https://www.facebook.com/feeds/page.php?format=rss20&id={page_info['page_id']}"
            
            try:
                async with self.session.get(rss_url) as response:
                    if response.status == 200:
                        rss_content = await response.text()
                        rss_posts = self._parse_facebook_rss(rss_content, ministry, page_info)
                        posts.extend(rss_posts)
            except Exception as e:
                logger.debug(f"RSS feed not available for {page_info['page_id']}: {e}")
            
            # Method 3: Try public API endpoints (if available)
            # Note: This would require proper API keys in production
            
            logger.info(f"Scraped {len(posts)} posts from {ministry} Facebook page")
            return posts
            
        except Exception as e:
            logger.error(f"Error scraping Facebook page for {ministry}: {e}")
            return []
    
    def _extract_mobile_facebook_posts(self, soup: BeautifulSoup, ministry: str, page_info: Dict[str, str]) -> List[FacebookPost]:
        """Extract posts from mobile Facebook HTML"""
        posts = []
        
        try:
            # Mobile Facebook post containers
            post_containers = soup.find_all('div', {'data-ft': True}) or soup.find_all('article')
            
            for container in post_containers[:10]:  # Limit to 10 recent posts
                try:
                    post = self._extract_single_facebook_post(container, ministry, page_info)
                    if post and self._calculate_legal_relevance(post.content) > 2.0:
                        posts.append(post)
                except Exception as e:
                    logger.debug(f"Error extracting single post: {e}")
                    continue
        
        except Exception as e:
            logger.error(f"Error extracting mobile Facebook posts: {e}")
        
        return posts
    
    def _extract_single_facebook_post(self, container, ministry: str, page_info: Dict[str, str]) -> Optional[FacebookPost]:
        """Extract a single Facebook post from container"""
        try:
            # Extract post content
            content_elem = container.find('p') or container.find('div', string=True)
            content = ""
            
            if content_elem:
                content = content_elem.get_text(strip=True)
            else:
                # Fallback: get all text from container
                content = container.get_text(strip=True)
            
            if not content or len(content) < 20:
                return None
            
            # Extract post ID (if available)
            post_id = ""
            data_ft = container.get('data-ft')
            if data_ft:
                try:
                    ft_data = json.loads(data_ft)
                    post_id = ft_data.get('mf_story_key', '')
                except:
                    pass
            
            # Extract engagement metrics (if visible)
            engagement = {'likes': 0, 'shares': 0, 'comments': 0}
            
            # Look for like/reaction counts
            like_elem = container.find(string=re.compile(r'\d+.*like|إعجاب'))
            if like_elem:
                likes = re.search(r'(\d+)', like_elem)
                if likes:
                    engagement['likes'] = int(likes.group(1))
            
            # Extract date (if available)
            published_date = None
            date_elem = container.find('abbr') or container.find(string=re.compile(r'\d+[hm]|ساعة|دقيقة'))
            if date_elem:
                published_date = self._parse_facebook_date(str(date_elem))
            
            # Generate post URL
            post_url = f"{page_info['url']}/posts/{post_id}" if post_id else page_info['url']
            
            # Calculate legal relevance
            legal_relevance = self._calculate_legal_relevance(content)
            legal_keywords = self._extract_legal_keywords(content)
            
            return FacebookPost(
                page_name=page_info['page_name'],
                ministry=ministry,
                post_id=post_id or f"fb_{hash(content)}",
                content=content,
                post_url=post_url,
                published_date=published_date,
                engagement=engagement,
                post_type='text',  # Default to text
                legal_relevance=legal_relevance,
                legal_keywords=legal_keywords
            )
            
        except Exception as e:
            logger.error(f"Error extracting single Facebook post: {e}")
            return None
    
    def _parse_facebook_rss(self, rss_content: str, ministry: str, page_info: Dict[str, str]) -> List[FacebookPost]:
        """Parse Facebook RSS feed"""
        posts = []
        
        try:
            import feedparser
            feed = feedparser.parse(rss_content)
            
            for entry in feed.entries[:10]:  # Limit to 10 recent posts
                title = entry.get('title', '')
                summary = entry.get('summary', entry.get('description', ''))
                content = f"{title} {summary}".strip()
                
                if len(content) < 20:
                    continue
                
                # Parse published date
                published_date = None
                if hasattr(entry, 'published_parsed') and entry.published_parsed:
                    published_date = datetime(*entry.published_parsed[:6])
                
                # Calculate legal relevance
                legal_relevance = self._calculate_legal_relevance(content)
                
                if legal_relevance > 2.0:  # Only include legally relevant posts
                    post = FacebookPost(
                        page_name=page_info['page_name'],
                        ministry=ministry,
                        post_id=entry.get('id', f"rss_{hash(content)}"),
                        content=content,
                        post_url=entry.get('link', page_info['url']),
                        published_date=published_date,
                        engagement={'likes': 0, 'shares': 0, 'comments': 0},
                        post_type='rss',
                        legal_relevance=legal_relevance,
                        legal_keywords=self._extract_legal_keywords(content)
                    )
                    posts.append(post)
        
        except Exception as e:
            logger.error(f"Error parsing Facebook RSS: {e}")
        
        return posts
    
    def _parse_facebook_date(self, date_str: str) -> Optional[datetime]:
        """Parse Facebook date string"""
        try:
            now = datetime.now()
            
            # Handle relative dates
            if 'h' in date_str or 'ساعة' in date_str:
                hours = re.search(r'(\d+)', date_str)
                if hours:
                    return now - timedelta(hours=int(hours.group(1)))
            
            elif 'm' in date_str or 'دقيقة' in date_str:
                minutes = re.search(r'(\d+)', date_str)
                if minutes:
                    return now - timedelta(minutes=int(minutes.group(1)))
            
            elif 'd' in date_str or 'يوم' in date_str:
                days = re.search(r'(\d+)', date_str)
                if days:
                    return now - timedelta(days=int(days.group(1)))
            
            return None
            
        except Exception as e:
            logger.error(f"Error parsing Facebook date '{date_str}': {e}")
            return None
    
    def _calculate_legal_relevance(self, content: str) -> float:
        """Calculate legal relevance score (0-10)"""
        content_lower = content.lower()
        score = 0.0
        
        # Count legal keywords
        for keyword in self.legal_keywords:
            if keyword.lower() in content_lower:
                score += 1.0
        
        # Boost score for certain patterns
        if re.search(r'قانون|loi|décret|مرسوم', content_lower):
            score += 2.0
        
        if re.search(r'إعلان|annonce|communiqué|بيان', content_lower):
            score += 1.0
        
        if re.search(r'جديد|nouveau|تحديث|mise à jour', content_lower):
            score += 0.5
        
        return min(score, 10.0)  # Cap at 10
    
    def _extract_legal_keywords(self, content: str) -> List[str]:
        """Extract legal keywords from content"""
        content_lower = content.lower()
        found_keywords = []
        
        for keyword in self.legal_keywords:
            if keyword.lower() in content_lower:
                found_keywords.append(keyword)
        
        return found_keywords[:10]  # Limit to 10 keywords
    
    async def scrape_all_pages(self) -> List[FacebookPost]:
        """Scrape all configured Facebook pages"""
        all_posts = []
        
        try:
            if not self.session:
                await self.initialize()
            
            for ministry, page_info in self.government_pages.items():
                try:
                    logger.info(f"Scraping Facebook page for {ministry}")
                    posts = await self.scrape_facebook_page(ministry, page_info)
                    all_posts.extend(posts)
                    
                    # Respectful delay between pages
                    await asyncio.sleep(3)
                    
                except Exception as e:
                    logger.error(f"Error scraping Facebook page for {ministry}: {e}")
                    continue
            
            logger.info(f"Total Facebook posts scraped: {len(all_posts)}")
            return all_posts
            
        except Exception as e:
            logger.error(f"Error in scrape_all_pages: {e}")
            return []
    
    async def close(self):
        """Close the session"""
        if self.session:
            await self.session.close()
    
    async def health_check(self) -> str:
        """Check if Facebook scraper is healthy"""
        try:
            if not self.session:
                return "unhealthy - session not initialized"
            
            # Test connectivity to Facebook
            test_url = "https://m.facebook.com"
            async with self.session.get(test_url) as response:
                if response.status == 200:
                    return "healthy"
                else:
                    return f"unhealthy - Facebook returned {response.status}"
                    
        except Exception as e:
            return f"unhealthy - {str(e)}"

# Background task for continuous Facebook monitoring
async def continuous_facebook_monitoring():
    """
    Continuous Facebook monitoring task
    Runs every 20 minutes to collect fresh government posts
    """
    scraper = FacebookScraper()
    
    try:
        await scraper.initialize()
        
        while True:
            logger.info("Starting Facebook monitoring cycle...")
            
            posts = await scraper.scrape_all_pages()
            
            if posts:
                logger.info(f"Found {len(posts)} legally relevant Facebook posts")
                # TODO: Store posts in database with vector embeddings
                # This will be integrated with the data storage service
            
            # Wait 20 minutes before next cycle
            logger.info("Facebook monitoring cycle complete. Waiting 20 minutes...")
            await asyncio.sleep(1200)  # 20 minutes
            
    except Exception as e:
        logger.error(f"Error in continuous Facebook monitoring: {e}")
    finally:
        await scraper.close()