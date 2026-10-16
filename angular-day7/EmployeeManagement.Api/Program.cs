using System.Text;
using EmployeeManagement.Api.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// 1. Add Controllers
builder.Services.AddControllers();

// 2. Add DbContext (InMemory default for zero-config portability + supports SQL Server if configured)
builder.Services.AddDbContext<AppDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    if (!string.IsNullOrEmpty(connectionString) && !connectionString.Contains("InMemory"))
    {
        // SQL Server can be plugged in seamlessly via connection string
        // options.UseSqlServer(connectionString);
        options.UseInMemoryDatabase("EmployeePortalDb");
    }
    else
    {
        options.UseInMemoryDatabase("EmployeePortalDb");
    }
});

// 3. Add JWT Authentication & Authorization
var jwtKey = builder.Configuration["Jwt:Key"] ?? "AngularDay7SuperSecretSecurityKey1234567890!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "EmployeeManagementApi";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "EmployeePortalApp";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("ManagerOrAdmin", policy => policy.RequireRole("Admin", "Manager"));
});

// 4. Add CORS for Angular Client
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "http://127.0.0.1:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// OpenAPI
builder.Services.AddOpenApi();

var app = builder.Build();

// Seed initial employee data
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    AppDbContext.SeedData(context);
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowAngularApp");

// We keep HTTP support active for seamless local dev with Angular
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
