using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using EmployeeManagement.Api.Data;
using EmployeeManagement.Api.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace EmployeeManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;

    public AuthController(AppDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => 
            u.Username.ToLower() == request.Username.ToLower() && 
            u.PasswordHash == request.Password);

        if (user == null)
        {
            return Unauthorized(new { message = "Invalid username or password credentials" });
        }

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? "AngularDay7SuperSecretSecurityKey1234567890!");
        var expiresAt = DateTime.UtcNow.AddDays(7);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("FullName", user.FullName)
            }),
            Expires = expiresAt,
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
            Issuer = _config["Jwt:Issuer"] ?? "EmployeeManagementApi",
            Audience = _config["Jwt:Audience"] ?? "EmployeePortalApp"
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);

        return Ok(new AuthResponseDto
        {
            Token = tokenHandler.WriteToken(token),
            Username = user.Username,
            FullName = user.FullName,
            Role = user.Role,
            Email = user.Email,
            ExpiresAt = expiresAt
        });
    }

    [HttpGet("profile")]
    public IActionResult GetProfile()
    {
        var identity = HttpContext.User.Identity as ClaimsIdentity;
        if (identity == null || !identity.IsAuthenticated)
        {
            // Return mock profile if anonymous for easy dev inspection
            return Ok(new
            {
                Username = "admin",
                FullName = "System Administrator",
                Role = "Admin",
                Email = "admin@employeeportal.io"
            });
        }

        return Ok(new
        {
            Username = identity.FindFirst(ClaimTypes.Name)?.Value,
            Email = identity.FindFirst(ClaimTypes.Email)?.Value,
            Role = identity.FindFirst(ClaimTypes.Role)?.Value,
            FullName = identity.FindFirst("FullName")?.Value
        });
    }
}
