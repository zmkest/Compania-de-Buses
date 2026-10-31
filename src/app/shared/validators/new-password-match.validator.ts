import { AbstractControl, ValidationErrors } from '@angular/forms';

// Valida que "newPwd" y "repitNewPwd" coincidan (formularios de restablecer y cambiar contraseña).
export function newPasswordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPwd = control.get('newPwd')?.value;
    const repitNewPwd = control.get('repitNewPwd')?.value;
    return newPwd === repitNewPwd ? null : { passwordMismatch: true };
}
