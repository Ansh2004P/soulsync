@echo off
REM SoulSync Artillery Load Testing Suite for Windows
REM This script runs comprehensive load tests for the SoulSync application

echo 🚀 SoulSync Load Testing Suite
echo ================================

REM Check if Artillery is installed
where artillery >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ Artillery is not installed. Installing globally...
    npm install -g artillery
)

REM Create results directory
if not exist "load-test-results" mkdir load-test-results

REM Get timestamp
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "timestamp=%dt:~0,8%_%dt:~8,6%"

echo 📊 Starting load tests at %date% %time%
echo Results will be saved in load-test-results/

echo.
echo 🔷 Select tests to run:
echo 1. Full Load Test (recommended for comprehensive testing)
echo 2. Spike Test (test sudden load increases)
echo 3. Stress Test (test under heavy sustained load)
echo 4. Volume Test (long duration test)
echo 5. All tests (sequential execution)
echo 6. Quick Test (abbreviated version of full test)
echo.

set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" goto full_test
if "%choice%"=="2" goto spike_test
if "%choice%"=="3" goto stress_test
if "%choice%"=="4" goto volume_test
if "%choice%"=="5" goto all_tests
if "%choice%"=="6" goto quick_test

echo ❌ Invalid choice
goto end

:full_test
call :run_test "artillery.yml" "full_load_test" "Comprehensive load test with multiple phases"
goto end

:spike_test
call :run_test "artillery-spike.yml" "spike_test" "Test system response to sudden load spikes"
goto end

:stress_test
call :run_test "artillery-stress.yml" "stress_test" "Extended high-load stress testing"
goto end

:volume_test
call :run_test "artillery-volume.yml" "volume_test" "Long duration sustained load testing"
goto end

:all_tests
echo 🔄 Running all tests sequentially...
call :run_test "artillery.yml" "full_load_test" "Comprehensive load test"
timeout /t 60 /nobreak >nul
call :run_test "artillery-spike.yml" "spike_test" "Spike test"
timeout /t 60 /nobreak >nul
call :run_test "artillery-stress.yml" "stress_test" "Stress test"
timeout /t 60 /nobreak >nul
call :run_test "artillery-volume.yml" "volume_test" "Volume test"
goto end

:quick_test
REM Create quick test config
(
echo config:
echo   target: 'http://localhost:3000'
echo   phases:
echo     - duration: 30
echo       arrivalRate: 5
echo       name: "Quick Test"
echo   defaults:
echo     headers:
echo       'Content-Type': 'application/json'
echo.
echo scenarios:
echo   - name: "Quick API Test"
echo     weight: 100
echo     flow:
echo       - get:
echo           url: "/api/me"
echo           expect:
echo             - statusCode: [200, 401]
echo       - get:
echo           url: "/"
echo           expect:
echo             - statusCode: [200, 500]
) > artillery-quick.yml

call :run_test "artillery-quick.yml" "quick_test" "Quick validation test"
del artillery-quick.yml
goto end

:run_test
set config_file=%~1
set test_name=%~2
set description=%~3

echo.
echo 🔄 Running %test_name%...
echo Description: %description%

artillery run %config_file% --output "load-test-results\%test_name%_%timestamp%.json" > "load-test-results\%test_name%_%timestamp%.log" 2>&1

if %ERRORLEVEL% equ 0 (
    echo ✅ %test_name% completed successfully
    
    REM Generate HTML report
    artillery report "load-test-results\%test_name%_%timestamp%.json" --output "load-test-results\%test_name%_%timestamp%.html"
    
    echo 📋 Report generated: load-test-results\%test_name%_%timestamp%.html
) else (
    echo ❌ %test_name% failed
    echo Check log: load-test-results\%test_name%_%timestamp%.log
)
goto :eof

:end
echo.
echo 🎉 Load testing completed!
echo 📊 Summary of results:
dir /b load-test-results\*%timestamp%*

echo.
echo 💡 Tips for analyzing results:
echo 1. Open the .html report files in your browser for detailed metrics
echo 2. Look for response time percentiles (p95, p99) in the reports
echo 3. Monitor error rates and identify which endpoints are struggling
echo 4. Check server logs during test execution for backend issues
echo 5. Compare results across different test runs to track performance changes

echo.
echo 📈 Key metrics to monitor:
echo • Response times (average, median, p95, p99)
echo • Throughput (requests per second)
echo • Error rates by endpoint
echo • Memory and CPU usage during tests
echo • Database connection pool status

pause
