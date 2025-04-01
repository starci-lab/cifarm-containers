# List of Docker images to build and push
$services = @(
    @{ Name = "cli"; Dockerfile = "./apps/cli/Dockerfile"; Tag = "cifarm/cli" },
    @{ Name = "cron-scheduler"; Dockerfile = "./apps/cron-scheduler/Dockerfile"; Tag = "cifarm/cron-scheduler" },
    @{ Name = "cron-worker"; Dockerfile = "./apps/cron-worker/Dockerfile"; Tag = "cifarm/cron-worker" },
    @{ Name = "gameplay-service"; Dockerfile = "./apps/gameplay-service/Dockerfile"; Tag = "cifarm/gameplay-service" },
    @{ Name = "gameplay-subgraph"; Dockerfile = "./apps/gameplay-subgraph/Dockerfile"; Tag = "cifarm/gameplay-subgraph" },
    @{ Name = "graphql-gateway"; Dockerfile = "./apps/graphql-gateway/Dockerfile"; Tag = "cifarm/graphql-gateway" },
    @{ Name = "rest-api-gateway"; Dockerfile = "./apps/rest-api-gateway/Dockerfile"; Tag = "cifarm/rest-api-gateway" },
    @{ Name = "telegram-bot"; Dockerfile = "./apps/telegram-bot/Dockerfile"; Tag = "cifarm/telegram-bot" },
    @{ Name = "io"; Dockerfile = "./apps/io/Dockerfile"; Tag = "cifarm/io" }
)

# Function to build and push a Docker image
function BuildAndPush {
    param (
        $Name,
        $Dockerfile,
        $Tag
    )
    Write-Host "Building $Tag..."
    docker build -t $Tag -f $Dockerfile .
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to build $Tag"
        exit 1
    }
    Write-Host "Pushing $Tag..."
    docker push $Tag
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to push $Tag"
        exit 1
    }
    Write-Host "$Tag successfully built and pushed."
}

# Run all builds and pushes in parallel
$jobs = @()
foreach ($service in $services) {
    $jobs += Start-Job -ScriptBlock {
        param ($Name, $Dockerfile, $Tag)
        BuildAndPush -Name $Name -Dockerfile $Dockerfile -Tag $Tag
    } -ArgumentList $service.Name, $service.Dockerfile, $service.Tag
}

# Wait for all jobs to complete
$jobs | Wait-Job

# Check for errors
$failed = $jobs | Where-Object { $_.State -eq "Failed" }
if ($failed) {
    Write-Host "One or more Docker builds/pushes failed."
    exit 1
}

Write-Host "All Docker builds and pushes completed successfully."