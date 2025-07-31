# SoulSync Load Testing Guide

This directory contains comprehensive Artillery load testing configurations for the SoulSync application. These tests will help you understand your application's performance characteristics under various load conditions.

## 🚀 Quick Start

### Prerequisites
1. Install Artillery globally:
   ```bash
   npm install -g artillery
   ```

2. Ensure your SoulSync application is running on `http://localhost:3000`

3. Make sure you have valid test data in the database

### Running Tests

#### Windows Users:
```cmd
run-load-tests.bat
```

#### Linux/Mac Users:
```bash
chmod +x run-load-tests.sh
./run-load-tests.sh
```

## 📊 Test Configurations

### 1. Full Load Test (`artillery.yml`)
**Purpose**: Comprehensive testing with multiple phases
- **Warm-up**: 30s at 1 req/s
- **Ramp-up**: 60s ramping from 1 to 10 req/s
- **Sustained**: 120s at 10 req/s
- **Peak**: 60s ramping from 10 to 25 req/s
- **Cool-down**: 30s ramping from 25 to 1 req/s

**Scenarios Tested**:
- Authentication flows (15% weight)
- Companion CRUD operations (40% weight)
- Chat functionality (35% weight)
- Homepage and search (10% weight)

### 2. Spike Test (`artillery-spike.yml`)
**Purpose**: Test sudden load increases
- **Baseline**: 10s at 1 req/s
- **Spike**: 30s at 50 req/s
- **Recovery**: 10s at 1 req/s

### 3. Stress Test (`artillery-stress.yml`)
**Purpose**: Extended high-load testing
- **Duration**: 5 minutes at 20 req/s
- **Focus**: Heavy chat operations and companion management

### 4. Volume Test (`artillery-volume.yml`)
**Purpose**: Long-duration sustained load
- **Duration**: 30 minutes at 15 req/s
- **Focus**: Sustained operations with realistic pauses

## 📈 Key Metrics to Monitor

### Response Time Metrics
- **Average Response Time**: Overall performance indicator
- **Median (p50)**: Typical user experience
- **95th Percentile (p95)**: Experience for slower requests
- **99th Percentile (p99)**: Worst-case scenarios

### Throughput Metrics
- **Requests per Second (RPS)**: System capacity
- **Concurrent Users**: Maximum supported users

### Error Metrics
- **Error Rate**: Percentage of failed requests
- **Status Code Distribution**: Types of errors occurring

### Resource Metrics (Monitor Separately)
- **CPU Usage**: Server processing load
- **Memory Usage**: RAM consumption
- **Database Connections**: Connection pool utilization
- **Network I/O**: Bandwidth usage

## 🔍 API Endpoints Tested

### Authentication
- `GET /api/me` - User profile retrieval

### Companion Management
- `POST /api/companion` - Create companion
- `GET /api/companion/[id]` - Get companion details
- `PATCH /api/companion/[id]` - Update companion
- `DELETE /api/companion/[id]` - Delete companion

### Chat Operations
- `POST /api/chat/[chatId]` - Send chat message

### Frontend Pages
- `GET /` - Homepage with search and filtering
- `GET /?name=[term]` - Search functionality
- `GET /?categoryId=[id]` - Category filtering

## 🎯 Performance Targets

### Acceptable Performance Levels
- **Response Time**: < 500ms for 95% of requests
- **Error Rate**: < 1% under normal load
- **Throughput**: Handle expected concurrent users + 50% buffer

### Warning Thresholds
- **Response Time**: > 1000ms for p95
- **Error Rate**: > 5%
- **Database**: Connection pool > 80% utilization

### Critical Thresholds
- **Response Time**: > 2000ms for p95
- **Error Rate**: > 10%
- **Server**: CPU > 90% or Memory > 90%

## 🔧 Customizing Tests

### Modifying Load Patterns
Edit the `phases` section in any configuration file:
```yaml
phases:
  - duration: 60    # Test duration in seconds
    arrivalRate: 10 # Users per second
    rampTo: 20      # Ramp to this rate (optional)
    name: "My Phase"
```

### Adding New Scenarios
Add to the `scenarios` section:
```yaml
scenarios:
  - name: "My Custom Test"
    weight: 50  # Percentage of traffic
    flow:
      - get:
          url: "/my-endpoint"
          expect:
            - statusCode: 200
```

### Custom Test Data
Modify `test-data.csv` with your actual companion IDs and category IDs:
```csv
companionId,categoryId,searchTerm,chatMessage
your-real-companion-id,your-real-category-id,search-term,test message
```

## 📋 Analyzing Results

### HTML Reports
Each test generates an HTML report with:
- Request/response time graphs
- Error rate charts
- Throughput metrics
- Detailed statistics

### Key Areas to Investigate

#### High Response Times
1. Check database query performance
2. Review API endpoint optimization
3. Examine external service calls (Google GenAI)

#### High Error Rates
1. Review authentication failures
2. Check database connection limits
3. Examine input validation errors

#### Memory/CPU Issues
1. Monitor database connection pooling
2. Check for memory leaks
3. Review caching strategies

## 🚨 Troubleshooting

### Common Issues

#### "Connection Refused"
- Ensure your app is running on localhost:3000
- Check firewall settings

#### "Unauthorized" Errors
- Update test data with valid authentication
- Check Kinde Auth configuration

#### High Database Errors
- Increase connection pool size
- Check database server capacity

#### Timeout Errors
- Increase Artillery timeout settings
- Optimize slow database queries

### Debug Mode
Run with debug output:
```bash
DEBUG=artillery:runner artillery run artillery.yml
```

## 📊 Continuous Performance Testing

### Integration with CI/CD
Add performance tests to your pipeline:
```yaml
# GitHub Actions example
- name: Run Performance Tests
  run: |
    npm start &
    sleep 30
    artillery run artillery.yml --quiet
    pkill node
```

### Regular Testing Schedule
- **Daily**: Quick tests during development
- **Weekly**: Full load tests
- **Pre-deployment**: Stress and spike tests
- **Monthly**: Volume tests

## 🎯 Performance Optimization Tips

### Database Optimization
1. Add proper indexes on frequently queried fields
2. Implement connection pooling
3. Use read replicas for heavy read operations

### API Optimization
1. Implement response caching
2. Add request rate limiting
3. Optimize serialization/deserialization

### Frontend Optimization
1. Implement proper loading states
2. Add client-side caching
3. Optimize bundle sizes

### Infrastructure
1. Use CDN for static assets
2. Implement horizontal scaling
3. Add health checks and monitoring

Remember to always test in an environment that closely mirrors your production setup for the most accurate results!
