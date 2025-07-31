#!/bin/bash

# SoulSync Artillery Load Testing Suite
# This script runs comprehensive load tests for the SoulSync application

echo "🚀 SoulSync Load Testing Suite"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Artillery is installed
if ! command -v artillery &> /dev/null; then
    echo -e "${RED}❌ Artillery is not installed. Installing globally...${NC}"
    npm install -g artillery
fi

# Create results directory
mkdir -p load-test-results
timestamp=$(date +"%Y%m%d_%H%M%S")

echo -e "${BLUE}📊 Starting load tests at $(date)${NC}"
echo "Results will be saved in load-test-results/"

# Function to run a test
run_test() {
    local config_file=$1
    local test_name=$2
    local description=$3
    
    echo -e "\n${YELLOW}🔄 Running $test_name...${NC}"
    echo "Description: $description"
    
    artillery run $config_file \
        --output "load-test-results/${test_name}_${timestamp}.json" \
        > "load-test-results/${test_name}_${timestamp}.log" 2>&1
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $test_name completed successfully${NC}"
        
        # Generate HTML report
        artillery report "load-test-results/${test_name}_${timestamp}.json" \
            --output "load-test-results/${test_name}_${timestamp}.html"
        
        echo -e "${BLUE}📋 Report generated: load-test-results/${test_name}_${timestamp}.html${NC}"
    else
        echo -e "${RED}❌ $test_name failed${NC}"
        echo "Check log: load-test-results/${test_name}_${timestamp}.log"
    fi
}

# Ask user which tests to run
echo -e "\n${BLUE}Select tests to run:${NC}"
echo "1. Full Load Test (recommended for comprehensive testing)"
echo "2. Spike Test (test sudden load increases)"
echo "3. Stress Test (test under heavy sustained load)"
echo "4. Volume Test (long duration test)"
echo "5. All tests (sequential execution)"
echo "6. Quick Test (abbreviated version of full test)"

read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        run_test "artillery.yml" "full_load_test" "Comprehensive load test with multiple phases"
        ;;
    2)
        run_test "artillery-spike.yml" "spike_test" "Test system response to sudden load spikes"
        ;;
    3)
        run_test "artillery-stress.yml" "stress_test" "Extended high-load stress testing"
        ;;
    4)
        run_test "artillery-volume.yml" "volume_test" "Long duration sustained load testing"
        ;;
    5)
        echo -e "${YELLOW}🔄 Running all tests sequentially...${NC}"
        run_test "artillery.yml" "full_load_test" "Comprehensive load test"
        sleep 60  # Cool down between tests
        run_test "artillery-spike.yml" "spike_test" "Spike test"
        sleep 60
        run_test "artillery-stress.yml" "stress_test" "Stress test"
        sleep 60
        run_test "artillery-volume.yml" "volume_test" "Volume test"
        ;;
    6)
        # Create quick test config
        cat > artillery-quick.yml << EOF
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 30
      arrivalRate: 5
      name: "Quick Test"
  defaults:
    headers:
      'Content-Type': 'application/json'

scenarios:
  - name: "Quick API Test"
    weight: 100
    flow:
      - get:
          url: "/api/me"
          expect:
            - statusCode: [200, 401]
      - get:
          url: "/"
          expect:
            - statusCode: [200, 500]
EOF
        run_test "artillery-quick.yml" "quick_test" "Quick validation test"
        rm artillery-quick.yml
        ;;
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

echo -e "\n${GREEN}🎉 Load testing completed!${NC}"
echo -e "${BLUE}📊 Summary of results:${NC}"
ls -la load-test-results/*${timestamp}*

echo -e "\n${YELLOW}💡 Tips for analyzing results:${NC}"
echo "1. Open the .html report files in your browser for detailed metrics"
echo "2. Look for response time percentiles (p95, p99) in the reports"
echo "3. Monitor error rates and identify which endpoints are struggling"
echo "4. Check server logs during test execution for backend issues"
echo "5. Compare results across different test runs to track performance changes"

echo -e "\n${BLUE}📈 Key metrics to monitor:${NC}"
echo "• Response times (average, median, p95, p99)"
echo "• Throughput (requests per second)"
echo "• Error rates by endpoint"
echo "• Memory and CPU usage during tests"
echo "• Database connection pool status"
