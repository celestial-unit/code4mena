"""
Real Web Scraper for Tunisian Government Websites
Scrapes actual government websites, news portals, and social media for legal intelligence

REVOLUTIONARY: Real-time legal intelligence from authentic Tunisian sources
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import aiohttp
from bs4 import BeautifulSoup
import json
import re
from urllib.parse import urljoin, urlparse
import feedparser
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class ScrapedContent:
    source: str
    ministry: str
    title: str
    content: str
    url: str
    published_date: Optional[datetime]
    content_type: str  # 'news', 'announcement', 'law', 'decree'
    language: str
    legal_keywords: List[str]

class RealWebScraper:
    """
    Real web scraper for Tunisian government sources
    Scrapes actual websites for legal intelligence
    """
    
    def __init__(self):
        self.session = None
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'ar,fr,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        }
        
        # Real Tunisian government sources
        self.government_sources = {
            "وزارة العدل": {
                "website": "https://www.e-justice.tn",
                "news_urls": [
                    "https://www.e-justice.tn/index.php?id=75",  # Actualités
                    "https://www.e-justice.tn/index.php?id=76"   # Communiqués
                ],
                "facebook_id": "MinistereJustice.Tunisie",
                "selectors": {
                    "title": ".news-title, .article-title, h1, h2",
                    "content": ".news-content, .article-content, .content, p",
                    "date": ".news-date, .date, .published"
                }
            },
            "وزارة التجارة": {
                "website": "https://www.commerce.gov.tn",
                "news_urls": [
                    "https://www.commerce.gov.tn/Fr/actualites_395_3",
                    "https://www.commerce.gov.tn/Fr/communiques_395_4"
                ],
                "facebook_id": "MinistereDuCommerce",
                "selectors": {
                    "title": ".titre, .title, h1, h2",
                    "content": ".contenu, .content, .texte, p",
                    "date": ".date, .published"
                }
            },
            "وزارة الصحة": {
                "website": "https://www.santetunisie.rns.tn",
                "news_urls": [
                    "https://www.santetunisie.rns.tn/fr/actualites",
                    "https://covid-19.tn/actualites"
                ],
                "facebook_id": "MinisteredelaSanteTunisie",
                "selectors": {
                    "title": ".news-title, .article-title, h1, h2",
                    "content": ".news-body, .article-body, .content, p",
                    "date": ".date, .published, .news-date"
                }
            },
            "وزارة المالية": {
                "website": "https://www.finances.gov.tn",
                "news_urls": [
                    "https://www.finances.gov.tn/fr/actualites",
                    "https://www.finances.gov.tn/fr/fiscalite"
                ],
                "facebook_id": "MinistereFinances.TN",
                "selectors": {
                    "title": ".title, .titre, h1, h2",
                    "content": ".content, .contenu, .texte, p",
                    "date": ".date, .published"
                }
            },
            "وزارة الداخلية": {
                "website": "https://www.interieur.gov.tn",
                "news_urls": [
                    "https://www.interieur.gov.tn/fr/actualites",
                    "https://www.interieur.gov.tn/fr/communiques"
                ],
                "facebook_id": "MinistereInterieur.TN",
                "selectors": {
                    "title": ".news-title, .title, h1, h2",
                    "content": ".news-content, .content, p",
                    "date": ".date, .published"
                }
            }
        }
        
        # Legal keywords to identify relevant content
        self.legal_keywords = [
            # Arabic legal terms
            'قانون', 'مرسوم', 'أمر', 'قرار', 'منشور', 'تشريع', 'لائحة', 'نظام',
            'محكمة', 'قضاء', 'عدالة', 'حكم', 'دستور', 'برلمان', 'مجلس', 'نواب',
            'شركة', 'تجارة', 'استثمار', 'ضريبة', 'جباية', 'رخصة', 'ترخيص',
            'عمل', 'عامل', 'موظف', 'أجر', 'راتب', 'تأمين', 'ضمان',
            'صحة', 'طب', 'دواء', 'مستشفى', 'علاج', 'وقاية',
            'تعليم', 'جامعة', 'مدرسة', 'شهادة', 'امتحان',
            'نقل', 'مواصلات', 'طريق', 'سيارة', 'رخصة سياقة',
            'بيئة', 'تلوث', 'نظافة', 'نفايات', 'طاقة',
            
            # French legal terms
            'loi', 'décret', 'arrêté', 'décision', 'circulaire', 'législation',
            'tribunal', 'justice', 'jugement', 'constitution', 'parlement',
            'entreprise', 'commerce', 'investissement', 'taxe', 'impôt',
            'travail', 'employé', 'salaire', 'assurance',
            'santé', 'médecine', 'médicament', 'hôpital',
            'éducation', 'université', 'école', 'diplôme',
            'transport', 'route', 'permis de conduire',
            'environnement', 'pollution', 'énergie'
        ]
    
    async def initialize(self):
        """Initialize the web scraper"""
        try:
            connector = aiohttp.TCPConnector(
                limit=10,
                limit_per_host=5,
                ttl_dns_cache=300,
                use_dns_cache=True,
                ssl=False  # Some government sites have SSL issues
            )
            
            timeout = aiohttp.ClientTimeout(total=30, connect=10)
            
            self.session = aiohttp.ClientSession(
                headers=self.headers,
                connector=connector,
                timeout=timeout
            )
            
            logger.info("Real web scraper initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error initializing real web scraper: {e}")
            return False
    
    async def scrape_government_website(self, ministry: str, source_info: Dict[str, Any]) -> List[ScrapedContent]:
        """
        Scrape a specific government ministry website
        
        Args:
            ministry: Ministry name in Arabic
            source_info: Source configuration
            
        Returns:
            List of scraped content
        """
        scraped_content = []
        
        try:
            if not self.session:
                await self.initialize()
            
            # Scrape news URLs
            for news_url in source_info.get('news_urls', []):
                try:
                    logger.info(f"Scraping {ministry} from {news_url}")
                    
                    async with self.session.get(news_url) as response:
                        if response.status == 200:
                            html = await response.text()
                            soup = BeautifulSoup(html, 'html.parser')
                            
                            # Extract articles/news items
                            articles = self._extract_articles(soup, source_info['selectors'])
                            
                            for article in articles:
                                if self._has_legal_content(article['title'] + ' ' + article['content']):
                                    content = ScrapedContent(
                                        source=news_url,
                                        ministry=ministry,
                                        title=article['title'],
                                        content=article['content'],
                                        url=article.get('url', news_url),
                                        published_date=article.get('date'),
                                        content_type='news',
                                        language=self._detect_language(article['content']),
                                        legal_keywords=self._extract_legal_keywords(article['title'] + ' ' + article['content'])
                                    )
                                    scraped_content.append(content)
                        
                        else:
                            logger.warning(f"Failed to access {news_url}: HTTP {response.status}")
                
                except Exception as e:
                    logger.error(f"Error scraping {news_url}: {e}")
                    continue
                
                # Small delay between requests
                await asyncio.sleep(1)
            
            logger.info(f"Scraped {len(scraped_content)} legal content items from {ministry}")
            return scraped_content
            
        except Exception as e:
            logger.error(f"Error scraping {ministry}: {e}")
            return []
    
    def _extract_articles(self, soup: BeautifulSoup, selectors: Dict[str, str]) -> List[Dict[str, Any]]:
        """Extract articles from HTML using CSS selectors"""
        articles = []
        
        try:
            # Try to find article containers
            article_containers = soup.find_all(['article', 'div'], class_=re.compile(r'(news|article|post|item)', re.I))
            
            if not article_containers:
                # Fallback: look for title elements and extract surrounding content
                titles = soup.select(selectors['title'])
                for title_elem in titles[:10]:  # Limit to first 10
                    article = self._extract_single_article(title_elem, selectors)
                    if article:
                        articles.append(article)
            else:
                # Extract from article containers
                for container in article_containers[:10]:  # Limit to first 10
                    article = self._extract_article_from_container(container, selectors)
                    if article:
                        articles.append(article)
        
        except Exception as e:
            logger.error(f"Error extracting articles: {e}")
        
        return articles
    
    def _extract_single_article(self, title_elem, selectors: Dict[str, str]) -> Optional[Dict[str, Any]]:
        """Extract a single article starting from title element"""
        try:
            title = title_elem.get_text(strip=True)
            if not title or len(title) < 10:
                return None
            
            # Find content near the title
            content_parts = []
            
            # Look for content in siblings
            for sibling in title_elem.find_next_siblings(['p', 'div'], limit=5):
                text = sibling.get_text(strip=True)
                if text and len(text) > 20:
                    content_parts.append(text)
            
            # Look for content in parent container
            parent = title_elem.find_parent(['article', 'div'])
            if parent:
                for p in parent.find_all('p', limit=3):
                    text = p.get_text(strip=True)
                    if text and len(text) > 20 and text not in content_parts:
                        content_parts.append(text)
            
            content = ' '.join(content_parts[:3])  # Limit content length
            
            if len(content) < 50:
                return None
            
            # Try to extract date
            date = None
            date_elem = title_elem.find_next(string=re.compile(r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}'))
            if date_elem:
                date = self._parse_date(date_elem)
            
            # Try to extract URL
            url = None
            link_elem = title_elem.find('a') or title_elem.find_parent('a')
            if link_elem and link_elem.get('href'):
                url = link_elem['href']
            
            return {
                'title': title,
                'content': content,
                'date': date,
                'url': url
            }
            
        except Exception as e:
            logger.error(f"Error extracting single article: {e}")
            return None
    
    def _extract_article_from_container(self, container, selectors: Dict[str, str]) -> Optional[Dict[str, Any]]:
        """Extract article from a container element"""
        try:
            # Extract title
            title_elem = container.select_one(selectors['title'])
            title = title_elem.get_text(strip=True) if title_elem else ""
            
            if not title or len(title) < 10:
                return None
            
            # Extract content
            content_parts = []
            content_elems = container.select(selectors['content'])
            for elem in content_elems[:5]:  # Limit to first 5 paragraphs
                text = elem.get_text(strip=True)
                if text and len(text) > 20:
                    content_parts.append(text)
            
            content = ' '.join(content_parts)
            
            if len(content) < 50:
                return None
            
            # Extract date
            date = None
            date_elem = container.select_one(selectors['date'])
            if date_elem:
                date = self._parse_date(date_elem.get_text(strip=True))
            
            # Extract URL
            url = None
            link_elem = container.find('a')
            if link_elem and link_elem.get('href'):
                url = link_elem['href']
            
            return {
                'title': title,
                'content': content,
                'date': date,
                'url': url
            }
            
        except Exception as e:
            logger.error(f"Error extracting article from container: {e}")
            return None
    
    def _parse_date(self, date_str: str) -> Optional[datetime]:
        """Parse date string to datetime object"""
        try:
            # Common date patterns
            patterns = [
                r'(\d{1,2})[/-](\d{1,2})[/-](\d{4})',  # DD/MM/YYYY or DD-MM-YYYY
                r'(\d{4})[/-](\d{1,2})[/-](\d{1,2})',  # YYYY/MM/DD or YYYY-MM-DD
                r'(\d{1,2})\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+(\d{4})',  # French months
            ]
            
            for pattern in patterns:
                match = re.search(pattern, date_str, re.IGNORECASE)
                if match:
                    if 'janvier' in pattern:  # French month pattern
                        day, month_name, year = match.groups()
                        month_map = {
                            'janvier': 1, 'février': 2, 'mars': 3, 'avril': 4,
                            'mai': 5, 'juin': 6, 'juillet': 7, 'août': 8,
                            'septembre': 9, 'octobre': 10, 'novembre': 11, 'décembre': 12
                        }
                        month = month_map.get(month_name.lower(), 1)
                        return datetime(int(year), month, int(day))
                    else:
                        groups = match.groups()
                        if len(groups) == 3:
                            if len(groups[2]) == 4:  # YYYY format
                                return datetime(int(groups[2]), int(groups[1]), int(groups[0]))
                            else:  # DD/MM/YY format
                                year = int(groups[2])
                                if year < 50:
                                    year += 2000
                                else:
                                    year += 1900
                                return datetime(year, int(groups[1]), int(groups[0]))
            
            return None
            
        except Exception as e:
            logger.error(f"Error parsing date '{date_str}': {e}")
            return None
    
    def _has_legal_content(self, text: str) -> bool:
        """Check if text contains legal keywords"""
        text_lower = text.lower()
        return any(keyword.lower() in text_lower for keyword in self.legal_keywords)
    
    def _extract_legal_keywords(self, text: str) -> List[str]:
        """Extract legal keywords found in text"""
        text_lower = text.lower()
        found_keywords = []
        
        for keyword in self.legal_keywords:
            if keyword.lower() in text_lower:
                found_keywords.append(keyword)
        
        return found_keywords[:10]  # Limit to 10 keywords
    
    def _detect_language(self, text: str) -> str:
        """Detect language of text (simple heuristic)"""
        # Count Arabic vs Latin characters
        arabic_chars = len(re.findall(r'[\u0600-\u06FF]', text))
        latin_chars = len(re.findall(r'[a-zA-Z]', text))
        
        if arabic_chars > latin_chars:
            return 'ar'
        elif latin_chars > 0:
            return 'fr'
        else:
            return 'unknown'
    
    async def scrape_all_ministries(self) -> List[ScrapedContent]:
        """Scrape all configured government ministries"""
        all_content = []
        
        try:
            if not self.session:
                await self.initialize()
            
            for ministry, source_info in self.government_sources.items():
                try:
                    logger.info(f"Starting scrape for {ministry}")
                    content = await self.scrape_government_website(ministry, source_info)
                    all_content.extend(content)
                    
                    # Delay between ministries to be respectful
                    await asyncio.sleep(2)
                    
                except Exception as e:
                    logger.error(f"Error scraping {ministry}: {e}")
                    continue
            
            logger.info(f"Total scraped content: {len(all_content)} items")
            return all_content
            
        except Exception as e:
            logger.error(f"Error in scrape_all_ministries: {e}")
            return []
    
    async def scrape_news_portals(self) -> List[ScrapedContent]:
        """Scrape Tunisian news portals for legal news"""
        news_content = []
        
        # Major Tunisian news portals
        news_sources = {
            "الصباح": {
                "url": "https://www.assabah.com.tn",
                "rss": "https://www.assabah.com.tn/rss.xml",
                "sections": ["https://www.assabah.com.tn/category/politique"]
            },
            "الشروق": {
                "url": "https://www.alchourouk.com",
                "sections": ["https://www.alchourouk.com/category/politique"]
            },
            "تونس الرقمية": {
                "url": "https://www.tunisienumerique.com",
                "rss": "https://www.tunisienumerique.com/feed/",
                "sections": ["https://www.tunisienumerique.com/category/politique/"]
            }
        }
        
        try:
            for source_name, source_info in news_sources.items():
                try:
                    # Try RSS first
                    if 'rss' in source_info:
                        rss_content = await self._scrape_rss_feed(source_info['rss'], source_name)
                        news_content.extend(rss_content)
                    
                    # Scrape sections
                    for section_url in source_info.get('sections', []):
                        section_content = await self._scrape_news_section(section_url, source_name)
                        news_content.extend(section_content)
                    
                    await asyncio.sleep(2)  # Respectful delay
                    
                except Exception as e:
                    logger.error(f"Error scraping news source {source_name}: {e}")
                    continue
            
            logger.info(f"Scraped {len(news_content)} news items")
            return news_content
            
        except Exception as e:
            logger.error(f"Error scraping news portals: {e}")
            return []
    
    async def _scrape_rss_feed(self, rss_url: str, source_name: str) -> List[ScrapedContent]:
        """Scrape RSS feed for legal news"""
        content = []
        
        try:
            async with self.session.get(rss_url) as response:
                if response.status == 200:
                    rss_text = await response.text()
                    feed = feedparser.parse(rss_text)
                    
                    for entry in feed.entries[:20]:  # Limit to 20 recent items
                        title = entry.get('title', '')
                        summary = entry.get('summary', entry.get('description', ''))
                        
                        if self._has_legal_content(title + ' ' + summary):
                            published_date = None
                            if hasattr(entry, 'published_parsed') and entry.published_parsed:
                                published_date = datetime(*entry.published_parsed[:6])
                            
                            scraped_item = ScrapedContent(
                                source=rss_url,
                                ministry=source_name,
                                title=title,
                                content=summary,
                                url=entry.get('link', rss_url),
                                published_date=published_date,
                                content_type='news',
                                language=self._detect_language(summary),
                                legal_keywords=self._extract_legal_keywords(title + ' ' + summary)
                            )
                            content.append(scraped_item)
        
        except Exception as e:
            logger.error(f"Error scraping RSS feed {rss_url}: {e}")
        
        return content
    
    async def _scrape_news_section(self, section_url: str, source_name: str) -> List[ScrapedContent]:
        """Scrape a news section for legal content"""
        content = []
        
        try:
            async with self.session.get(section_url) as response:
                if response.status == 200:
                    html = await response.text()
                    soup = BeautifulSoup(html, 'html.parser')
                    
                    # Generic selectors for news articles
                    selectors = {
                        'title': 'h1, h2, h3, .title, .headline, .article-title',
                        'content': 'p, .excerpt, .summary, .description',
                        'date': '.date, .published, .time'
                    }
                    
                    articles = self._extract_articles(soup, selectors)
                    
                    for article in articles:
                        if self._has_legal_content(article['title'] + ' ' + article['content']):
                            scraped_item = ScrapedContent(
                                source=section_url,
                                ministry=source_name,
                                title=article['title'],
                                content=article['content'],
                                url=article.get('url', section_url),
                                published_date=article.get('date'),
                                content_type='news',
                                language=self._detect_language(article['content']),
                                legal_keywords=self._extract_legal_keywords(article['title'] + ' ' + article['content'])
                            )
                            content.append(scraped_item)
        
        except Exception as e:
            logger.error(f"Error scraping news section {section_url}: {e}")
        
        return content
    
    async def close(self):
        """Close the session"""
        if self.session:
            await self.session.close()
    
    async def health_check(self) -> str:
        """Check if the web scraper is healthy"""
        try:
            if not self.session:
                return "unhealthy - session not initialized"
            
            # Test connectivity to a government site
            test_url = "https://www.e-justice.tn"
            async with self.session.get(test_url) as response:
                if response.status == 200:
                    return "healthy"
                else:
                    return f"unhealthy - test site returned {response.status}"
                    
        except Exception as e:
            return f"unhealthy - {str(e)}"

# Background task for continuous web scraping
async def continuous_web_scraping():
    """
    Continuous web scraping task
    Runs every 30 minutes to collect fresh legal intelligence
    """
    scraper = RealWebScraper()
    
    try:
        await scraper.initialize()
        
        while True:
            logger.info("Starting web scraping cycle...")
            
            # Scrape government websites
            gov_content = await scraper.scrape_all_ministries()
            
            # Scrape news portals
            news_content = await scraper.scrape_news_portals()
            
            all_content = gov_content + news_content
            
            if all_content:
                logger.info(f"Scraped {len(all_content)} legal content items")
                # TODO: Store in database with vector embeddings
                # This will be integrated with the data storage service
            
            # Wait 30 minutes before next cycle
            logger.info("Web scraping cycle complete. Waiting 30 minutes...")
            await asyncio.sleep(1800)  # 30 minutes
            
    except Exception as e:
        logger.error(f"Error in continuous web scraping: {e}")
    finally:
        await scraper.close()