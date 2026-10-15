import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RoleSelector } from '../../../../shared/components/role-selector/role-selector';

@Component({
  selector: 'app-login-page',
  imports: [RouterLink, RoleSelector],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css'
})
export class LoginPage {}
