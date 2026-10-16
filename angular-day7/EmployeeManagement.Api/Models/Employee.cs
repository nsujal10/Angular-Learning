using System.ComponentModel.DataAnnotations;

namespace EmployeeManagement.Api.Models;

public class Employee
{
    public int Id { get; set; }

    [Required]
    [StringLength(50, MinimumLength = 2)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [StringLength(50, MinimumLength = 2)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Phone]
    public string Phone { get; set; } = string.Empty;

    [Required]
    public string Department { get; set; } = "Engineering";

    [Required]
    public string Role { get; set; } = "Software Engineer";

    [Range(20000, 500000)]
    public decimal Salary { get; set; }

    public DateTime JoiningDate { get; set; } = DateTime.UtcNow;

    public string Status { get; set; } = "Active"; // Active, OnLeave, Terminated

    [Range(1, 100)]
    public int PerformanceScore { get; set; } = 85;

    public string Avatar { get; set; } = string.Empty;

    public string Bio { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
