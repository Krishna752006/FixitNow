$body = @{
    identifier = "test@example.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri 'http://localhost:5000/api/auth/login/user' `
    -Method POST `
    -ContentType 'application/json' `
    -Body $body `
    -Headers @{'Origin'='http://localhost:8080'} `
    -SkipHttpErrorCheck

Write-Host "Status Code: $($response.StatusCode)"
Write-Host "Response: $($response.Content)"
