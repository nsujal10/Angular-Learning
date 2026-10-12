import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  static corporateEmail(allowedDomain: string = 'spikeoffice.io'): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const email = String(control.value).toLowerCase().trim();
      const domainPattern = new RegExp(`^[a-zA-Z0-9._%+-]+@${allowedDomain.replace('.', '\\.')}$`);
      if (!domainPattern.test(email)) {
        return {
          invalidCorporateDomain: {
            requiredDomain: `@${allowedDomain}`,
            actual: email
          }
        };
      }
      return null;
    };
  }

  static humanName(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const value = String(control.value).trim();
      const nameRegex = /^[a-zA-Z\s'-]+$/;
      if (!nameRegex.test(value)) {
        return {
          invalidNameFormat: 'Name can only contain alphabetic letters, spaces, hyphens and apostrophes.'
        };
      }
      return null;
    };
  }

  static departmentSalaryBenchmark(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const department = group.get('department')?.value;
      const salary = Number(group.get('salary')?.value);

      if (!department || isNaN(salary) || salary <= 0) {
        return null;
      }

      const benchmarks: Record<string, number> = {
        Engineering: 70000,
        Finance: 65000,
        Product: 68000,
        Design: 60000,
        'Human Resources': 55000,
        Marketing: 50000
      };

      const minExpected = benchmarks[department] || 40000;
      if (salary < minExpected) {
        return {
          salaryBelowBenchmark: {
            department,
            minExpected,
            actual: salary
          }
        };
      }
      return null;
    };
  }

  static managerTeamSize(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const isManager = group.get('isManager')?.value;
      const teamSize = group.get('teamSize')?.value;

      if (isManager) {
        if (teamSize === null || teamSize === undefined || teamSize === '' || Number(teamSize) < 1) {
          return { managerRequiresTeamSize: true };
        }
      }
      return null;
    };
  }
}
