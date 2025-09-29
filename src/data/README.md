# Mock Data System

This directory contains the comprehensive mock data system for the Tunisian Legal App. The system provides realistic, culturally authentic data for development and testing purposes.

## Directory Structure

```
src/data/
├── mock/                          # Static JSON mock data files
│   ├── legal-updates.json         # Legal updates and news
│   ├── users.json                 # User profiles and preferences
│   ├── chat-conversations.json    # Chat conversations with AI
│   ├── mascots.json               # 3D Tunisian mascots data
│   └── search-results.json        # Search results and content
├── services/                      # Mock data services
│   ├── mockDataService.ts         # Core mock data service
│   └── mockApiClient.ts           # API client wrapper
└── utils/                         # Mock data utilities
    ├── mockDataManager.ts         # Data management utilities
    └── mockDataHelpers.ts         # Helper functions and constants
```

## Features

### 🌍 Culturally Authentic Content
- **Tunisian Legal Context**: All legal content reflects actual Tunisian law and regulations
- **Multi-language Support**: Content in Arabic, French, and English
- **Regional Relevance**: Data specific to different Tunisian regions
- **Cultural Elements**: Traditional symbols, dialects, and cultural references

### 📊 Comprehensive Data Types
- **Legal Updates**: News, regulations, and legal changes
- **User Profiles**: Detailed user information with preferences and statistics
- **Chat Conversations**: AI-powered legal consultations
- **Search Results**: Semantic search results with relevance scoring
- **3D Mascots**: Cultural mascots representing different sectors

### 🔧 Development Tools
- **Mock API Client**: Simulates real API calls with realistic delays
- **Data Manager**: Tools for creating, updating, and managing mock data
- **Helper Functions**: Utilities for data generation and manipulation
- **Validation**: Data integrity checks and validation functions

## Usage

### Basic Usage

```typescript
import { mockApiClient } from '../services';

// Get legal updates
const response = await mockApiClient.getLegalUpdates({
  page: 1,
  pageSize: 10,
  category: 'business_law'
});

// Send chat message
const conversation = await mockApiClient.sendChatMessage({
  conversationId: 'conv-001',
  message: 'What are the requirements for starting a business?',
  userId: 'user-001',
  language: 'ar'
});

// Search legal content
const searchResults = await mockApiClient.searchLegalContent({
  query: 'business registration',
  filters: {
    categories: ['business_law'],
    sectors: ['business']
  }
});
```

### Data Management

```typescript
import { mockDataManager } from '../utils';

// Create new legal update
const newUpdate = mockDataManager.createLegalUpdate({
  title: 'New Tax Regulation',
  category: 'tax_law',
  priority: 'high',
  sectors: ['business', 'money']
});

// Generate test data
const testUpdates = mockDataManager.generateLegalUpdatesByCategory('business_law', 10);

// Validate data
const validation = mockDataManager.validateLegalUpdate(newUpdate);
if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
}
```

### Helper Functions

```typescript
import { 
  getRandomElement, 
  translateCategory, 
  filterLegalUpdatesByCategory,
  calculateLegalUpdateStats 
} from '../utils/mockDataHelpers';

// Get random sector
const randomSector = getRandomElement(SECTORS);

// Translate category to Arabic
const categoryAr = translateCategory('business_law', 'ar');

// Filter updates
const businessUpdates = filterLegalUpdatesByCategory(allUpdates, ['business_law']);

// Calculate statistics
const stats = calculateLegalUpdateStats(businessUpdates);
```

## Mock Data Files

### legal-updates.json
Contains realistic Tunisian legal updates including:
- **Digital Tax Regulations**: New e-commerce tax requirements
- **Agricultural Reforms**: Land use and organic certification updates
- **Tourism Incentives**: Recovery packages for tourism businesses
- **Labor Law Changes**: Remote work regulations
- **Family Law Updates**: Child custody reforms

### users.json
Sample user profiles with:
- **Diverse Backgrounds**: Business owners, farmers, professionals
- **Regional Distribution**: Users from different Tunisian regions
- **Language Preferences**: Arabic, French, and English speakers
- **Sector Interests**: Various business and professional sectors
- **Achievement Systems**: Gamification elements and progress tracking

### chat-conversations.json
Realistic chat conversations featuring:
- **Legal Consultations**: Business registration, tax compliance
- **Cultural Context**: Tunisian greetings and cultural references
- **Multi-language Support**: Conversations in Arabic and French
- **AI Responses**: Contextual legal guidance with mascot animations
- **Metadata**: Confidence scores, sources, and cultural context

### mascots.json
3D Tunisian mascots including:
- **Sector-Specific**: Business, agriculture, money, tourism
- **Cultural Elements**: Traditional clothing, symbols, and accessories
- **Animations**: Greetings, explanations, celebrations
- **Customizations**: Unlockable items and cultural variations
- **Tunisian Symbols**: Historical and cultural references

### search-results.json
Comprehensive search results with:
- **Semantic Matching**: Relevance and similarity scores
- **Multi-source Content**: Government, parliamentary, legal databases
- **Highlighted Matches**: Search term highlighting
- **Metadata**: Processing time, confidence, cultural relevance
- **Related Results**: Cross-referenced content

## API Simulation

The mock API client simulates realistic backend behavior:

### Response Times
- **Simple Operations**: 500ms base delay
- **Medium Complexity**: 750ms delay
- **Complex Operations**: 1250ms delay
- **Random Variation**: ±500ms for realism

### Error Simulation
- **Network Errors**: Simulated connection issues
- **Validation Errors**: Data integrity checks
- **Rate Limiting**: API usage limits
- **Service Unavailable**: Temporary outages

### Response Format
All responses follow the standard API format:
```typescript
{
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    messageAr: string;
    messageFr: string;
  };
  timestamp: Date;
  requestId: string;
}
```

## Data Validation

### Legal Updates
- Required fields: ID, title, content, category, source
- Valid categories and sectors
- Proper date formats
- Multi-language content consistency

### Users
- Valid email format
- Required profile information
- Preference validation
- Statistics integrity

### Chat Conversations
- Message ordering
- Metadata completeness
- Cultural context validation
- Animation synchronization

## Development Workflow

### Adding New Mock Data

1. **Create JSON Data**: Add new entries to appropriate JSON files
2. **Update Types**: Ensure TypeScript interfaces match data structure
3. **Add Service Methods**: Implement API methods in mockApiClient
4. **Create Utilities**: Add helper functions for data manipulation
5. **Write Tests**: Validate data integrity and API responses

### Updating Existing Data

1. **Modify JSON Files**: Update static data files
2. **Run Validation**: Use mockDataManager validation functions
3. **Test API Responses**: Verify service methods work correctly
4. **Update Documentation**: Keep README and comments current

### Data Consistency

- **Multi-language**: Ensure all content has Arabic, French, and English versions
- **Cultural Accuracy**: Validate Tunisian cultural references
- **Legal Accuracy**: Verify legal content reflects actual Tunisian law
- **Cross-references**: Maintain data relationships and IDs

## Performance Considerations

### Memory Usage
- JSON files are loaded on demand
- Large datasets use pagination
- Efficient filtering and sorting algorithms

### Response Times
- Realistic delays for development testing
- Configurable timing for different scenarios
- Caching for frequently accessed data

### Scalability
- Modular data structure
- Easy addition of new data types
- Efficient search and filtering

## Testing Support

### Test Data Generation
```typescript
// Generate test datasets
const testData = createTestDataSet('large');

// Create specific test scenarios
const businessUser = mockDataManager.createMockUser({
  profile: { sectors: ['business'], experienceLevel: 'expert' }
});

// Generate random data for stress testing
const randomUpdates = mockDataManager.generateRandomData('legal_updates', 100);
```

### Data Validation
```typescript
// Validate all mock data
const allUpdates = /* load from JSON */;
allUpdates.forEach(update => {
  const validation = mockDataManager.validateLegalUpdate(update);
  if (!validation.isValid) {
    console.error(`Invalid update ${update.id}:`, validation.errors);
  }
});
```

## Future Enhancements

### Planned Features
- **Dynamic Data Generation**: AI-powered content creation
- **Real-time Updates**: Live data synchronization
- **Advanced Analytics**: User behavior simulation
- **Performance Metrics**: Response time optimization
- **Data Export/Import**: Backup and restore functionality

### Integration Points
- **Backend API**: Seamless transition to real backend
- **Database**: Direct database integration
- **External Services**: Third-party data sources
- **Analytics**: User behavior tracking
- **Caching**: Redis or similar caching layer

## Contributing

When contributing to the mock data system:

1. **Follow Conventions**: Use established naming and structure patterns
2. **Maintain Quality**: Ensure cultural and legal accuracy
3. **Add Documentation**: Update README and code comments
4. **Test Thoroughly**: Validate all changes
5. **Consider Performance**: Optimize for development workflow

## Support

For questions or issues with the mock data system:
- Check the TypeScript interfaces in `src/types/`
- Review service implementations in `src/services/`
- Examine utility functions in `src/utils/`
- Validate data using built-in validation functions