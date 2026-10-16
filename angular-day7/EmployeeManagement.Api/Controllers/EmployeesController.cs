using EmployeeManagement.Api.Data;
using EmployeeManagement.Api.DTOs;
using EmployeeManagement.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmployeesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<EmployeesController> _logger;

    public EmployeesController(AppDbContext context, ILogger<EmployeesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/employees
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Employee>>> GetEmployees(
        [FromQuery] string? search,
        [FromQuery] string? department,
        [FromQuery] string? status)
    {
        var query = _context.Employees.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.Trim().ToLower();
            query = query.Where(e =>
                e.FirstName.ToLower().Contains(searchLower) ||
                e.LastName.ToLower().Contains(searchLower) ||
                e.Email.ToLower().Contains(searchLower) ||
                e.Role.ToLower().Contains(searchLower));
        }

        if (!string.IsNullOrWhiteSpace(department) && department != "All")
        {
            query = query.Where(e => e.Department.ToLower() == department.Trim().ToLower());
        }

        if (!string.IsNullOrWhiteSpace(status) && status != "All")
        {
            query = query.Where(e => e.Status.ToLower() == status.Trim().ToLower());
        }

        var results = await query.OrderBy(e => e.Id).ToListAsync();
        return Ok(results);
    }

    // GET: api/employees/{id}
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Employee>> GetEmployee(int id)
    {
        var employee = await _context.Employees.FindAsync(id);
        if (employee == null)
        {
            return NotFound(new { message = $"Employee with ID #{id} was not found." });
        }
        return Ok(employee);
    }

    // POST: api/employees
    [HttpPost]
    public async Task<ActionResult<Employee>> CreateEmployee([FromBody] CreateEmployeeDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Check email uniqueness
        var emailExists = await _context.Employees.AnyAsync(e => e.Email.ToLower() == dto.Email.ToLower());
        if (emailExists)
        {
            ModelState.AddModelError("Email", "An employee with this email address already exists.");
            return BadRequest(ModelState);
        }

        var avatar = $"{dto.FirstName.Trim()[0]}{dto.LastName.Trim()[0]}".ToUpper();

        var employee = new Employee
        {
            FirstName = dto.FirstName.Trim(),
            LastName = dto.LastName.Trim(),
            Email = dto.Email.Trim().ToLower(),
            Phone = dto.Phone?.Trim() ?? string.Empty,
            Department = dto.Department.Trim(),
            Role = dto.Role.Trim(),
            Salary = dto.Salary,
            JoiningDate = dto.JoiningDate,
            Status = dto.Status.Trim(),
            PerformanceScore = dto.PerformanceScore,
            Avatar = avatar,
            Bio = dto.Bio?.Trim() ?? string.Empty,
            CreatedAt = DateTime.UtcNow
        };

        _context.Employees.Add(employee);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetEmployee), new { id = employee.Id }, employee);
    }

    // PUT: api/employees/{id}
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateEmployee(int id, [FromBody] UpdateEmployeeDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var employee = await _context.Employees.FindAsync(id);
        if (employee == null)
        {
            return NotFound(new { message = $"Employee with ID #{id} was not found." });
        }

        // Check email uniqueness if changed
        var emailExists = await _context.Employees.AnyAsync(e => e.Id != id && e.Email.ToLower() == dto.Email.ToLower());
        if (emailExists)
        {
            ModelState.AddModelError("Email", "An employee with this email address already exists.");
            return BadRequest(ModelState);
        }

        employee.FirstName = dto.FirstName.Trim();
        employee.LastName = dto.LastName.Trim();
        employee.Email = dto.Email.Trim().ToLower();
        employee.Phone = dto.Phone?.Trim() ?? string.Empty;
        employee.Department = dto.Department.Trim();
        employee.Role = dto.Role.Trim();
        employee.Salary = dto.Salary;
        employee.JoiningDate = dto.JoiningDate;
        employee.Status = dto.Status.Trim();
        employee.PerformanceScore = dto.PerformanceScore;
        employee.Avatar = $"{dto.FirstName.Trim()[0]}{dto.LastName.Trim()[0]}".ToUpper();
        employee.Bio = dto.Bio?.Trim() ?? string.Empty;
        employee.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(employee);
    }

    // DELETE: api/employees/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteEmployee(int id)
    {
        var employee = await _context.Employees.FindAsync(id);
        if (employee == null)
        {
            return NotFound(new { message = $"Employee with ID #{id} was not found." });
        }

        _context.Employees.Remove(employee);
        await _context.SaveChangesAsync();

        return Ok(new { message = $"Employee {employee.FirstName} {employee.LastName} was successfully removed." });
    }

    // GET: api/employees/dashboard/stats
    [HttpGet("dashboard/stats")]
    public async Task<ActionResult<DashboardStatsDto>> GetDashboardStats()
    {
        var employees = await _context.Employees.ToListAsync();

        var stats = new DashboardStatsDto
        {
            TotalEmployees = employees.Count,
            ActiveEmployees = employees.Count(e => e.Status.Equals("Active", StringComparison.OrdinalIgnoreCase)),
            OnLeaveEmployees = employees.Count(e => e.Status.Equals("OnLeave", StringComparison.OrdinalIgnoreCase)),
            TotalPayroll = employees.Sum(e => e.Salary),
            AverageSalary = employees.Any() ? Math.Round(employees.Average(e => e.Salary), 2) : 0,
            AveragePerformance = employees.Any() ? Math.Round(employees.Average(e => e.PerformanceScore), 1) : 0,
            DepartmentDistribution = employees
                .GroupBy(e => e.Department)
                .ToDictionary(g => g.Key, g => g.Count()),
            StatusDistribution = employees
                .GroupBy(e => e.Status)
                .ToDictionary(g => g.Key, g => g.Count()),
            RecentHires = employees
                .OrderByDescending(e => e.JoiningDate)
                .Take(5)
                .Select(e => new RecentHireDto
                {
                    Id = e.Id,
                    Name = $"{e.FirstName} {e.LastName}",
                    Role = e.Role,
                    Department = e.Department,
                    JoiningDate = e.JoiningDate,
                    Status = e.Status
                })
                .ToList()
        };

        return Ok(stats);
    }
}
