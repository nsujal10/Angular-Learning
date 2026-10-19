import { test, expect } from '@playwright/test';

test.describe('Employee Dashboard E2E Workflow', () => {
  test('should search for an employee, verify filtered result, and toggle status', async ({ page }) => {
    // 1. Visit the application root and assert redirect to /employees
    await page.goto('/');
    await expect(page).toHaveURL(/.*employees/);

    // 2. Verify page headers and initial state
    const pageHeading = page.locator('h1');
    await expect(pageHeading).toContainText('Workforce Management Directory');

    // 3. Search for an employee by name using Signals-backed search input
    const searchInput = page.locator('#employee-search-input');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Sarah Connor');

    // 4. Verify that only the expected employee appears in the filtered list
    const employeeRows = page.locator('.employee-row');
    await expect(employeeRows).toHaveCount(1);

    const employeeName = page.locator('#employee-name-101');
    await expect(employeeName).toBeVisible();
    await expect(employeeName).toContainText('Sarah Connor');

    const employeeSalary = page.locator('#employee-salary-101');
    await expect(employeeSalary).toContainText('$145,000');

    // 5. Toggle employee status and verify the reactive update on UI
    const toggleButton = page.locator('.employee-row .toggle-btn').first();
    await expect(toggleButton).toHaveText('Deactivate');
    await toggleButton.click();

    // Verify status pill changes reactively to "Inactive"
    const statusPill = page.locator('.employee-row .status-pill').first();
    await expect(statusPill).toContainText('Inactive');
    await expect(toggleButton).toHaveText('Activate');

    // 6. Test lazy-loaded Reports route navigation
    const reportsNavLink = page.locator('#nav-reports-link');
    await reportsNavLink.click();

    await expect(page).toHaveURL(/.*reports/);
    const reportsHeading = page.locator('h1');
    await expect(reportsHeading).toContainText('Executive Compensation & Workforce Reports');

    // Verify reports table rendered
    const reportsTable = page.locator('#reports-table');
    await expect(reportsTable).toBeVisible();
  });
});
