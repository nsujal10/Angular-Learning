using EmployeeManagement.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagement.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Fluent API configuration
        modelBuilder.Entity<Employee>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(50);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Email).IsRequired();
            entity.Property(e => e.Salary).HasPrecision(18, 2);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.Property(u => u.Username).IsRequired().HasMaxLength(50);
        });
    }

    public static void SeedData(AppDbContext context)
    {
        if (context.Employees.Any()) return;

        var employees = new List<Employee>
        {
            new()
            {
                Id = 1,
                FirstName = "Sujal",
                LastName = "Nage",
                Email = "sujal.nage@company.io",
                Phone = "+1 (555) 019-2834",
                Department = "Engineering",
                Role = "Lead Angular Architect",
                Salary = 145000,
                JoiningDate = DateTime.UtcNow.AddMonths(-18),
                Status = "Active",
                PerformanceScore = 96,
                Avatar = "SN",
                Bio = "Designs scalable enterprise architectures using standalone Angular, NgRx, and modern ASP.NET Core microservices."
            },
            new()
            {
                Id = 2,
                FirstName = "Sarah",
                LastName = "Connor",
                Email = "sarah.connor@company.io",
                Phone = "+1 (555) 014-9921",
                Department = "Engineering",
                Role = "VP of Engineering",
                Salary = 185000,
                JoiningDate = DateTime.UtcNow.AddMonths(-36),
                Status = "Active",
                PerformanceScore = 98,
                Avatar = "SC",
                Bio = "Leads enterprise engineering operations and technical roadmap strategy."
            },
            new()
            {
                Id = 3,
                FirstName = "Alex",
                LastName = "Mercer",
                Email = "alex.mercer@company.io",
                Phone = "+1 (555) 018-4412",
                Department = "Engineering",
                Role = "Senior Full Stack Developer",
                Salary = 120000,
                JoiningDate = DateTime.UtcNow.AddMonths(-12),
                Status = "Active",
                PerformanceScore = 90,
                Avatar = "AM",
                Bio = "Expertise in C# .NET Web APIs, Angular Signals, and automated CI/CD pipelines."
            },
            new()
            {
                Id = 4,
                FirstName = "Elena",
                LastName = "Rostova",
                Email = "elena.rostova@company.io",
                Phone = "+1 (555) 012-7788",
                Department = "Design",
                Role = "Lead Product Designer",
                Salary = 115000,
                JoiningDate = DateTime.UtcNow.AddMonths(-8),
                Status = "Active",
                PerformanceScore = 94,
                Avatar = "ER",
                Bio = "Designs intuitive, responsive user experiences with Angular Material and Figma token systems."
            },
            new()
            {
                Id = 5,
                FirstName = "Marcus",
                LastName = "Vance",
                Email = "marcus.vance@company.io",
                Phone = "+1 (555) 017-3329",
                Department = "Product",
                Role = "Principal Product Manager",
                Salary = 140000,
                JoiningDate = DateTime.UtcNow.AddMonths(-24),
                Status = "Active",
                PerformanceScore = 92,
                Avatar = "MV",
                Bio = "Orchestrates agile feature delivery and client-centric product iterations."
            },
            new()
            {
                Id = 6,
                FirstName = "Chloe",
                LastName = "Price",
                Email = "chloe.price@company.io",
                Phone = "+1 (555) 015-8832",
                Department = "Human Resources",
                Role = "HR Director",
                Salary = 105000,
                JoiningDate = DateTime.UtcNow.AddMonths(-14),
                Status = "OnLeave",
                PerformanceScore = 88,
                Avatar = "CP",
                Bio = "Manages talent acquisition, onboarding, and employee development programs."
            },
            new()
            {
                Id = 7,
                FirstName = "David",
                LastName = "Kim",
                Email = "david.kim@company.io",
                Phone = "+1 (555) 016-1199",
                Department = "Finance",
                Role = "Financial Controller",
                Salary = 130000,
                JoiningDate = DateTime.UtcNow.AddMonths(-30),
                Status = "Active",
                PerformanceScore = 95,
                Avatar = "DK",
                Bio = "Oversees fiscal planning, budget optimization, and quarterly projections."
            },
            new()
            {
                Id = 8,
                FirstName = "Rachel",
                LastName = "Amber",
                Email = "rachel.amber@company.io",
                Phone = "+1 (555) 011-5544",
                Department = "Marketing",
                Role = "Growth Marketing Lead",
                Salary = 98000,
                JoiningDate = DateTime.UtcNow.AddMonths(-6),
                Status = "Active",
                PerformanceScore = 89,
                Avatar = "RA",
                Bio = "Drives omnichannel customer acquisition, analytics, and brand expansion."
            }
        };

        context.Employees.AddRange(employees);

        context.Users.Add(new User
        {
            Id = 1,
            Username = "admin",
            Email = "admin@employeeportal.io",
            PasswordHash = "admin123", // In production use Argon2/BCrypt
            Role = "Admin",
            FullName = "System Administrator"
        });

        context.SaveChanges();
    }
}
