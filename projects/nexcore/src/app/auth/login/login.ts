import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@nexcore/core';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  username = '';
  password = '';
  remember = true;
  showPassword = false;

  usernameError = '';
  passwordError = '';
  error = '';
  sessionExpired = false;
  isLoading = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['reason'] === 'session-expired') {
        this.sessionExpired = true;
        this.cdr.detectChanges();
      }
    });
  }

  submit() {
    this.usernameError = '';
    this.passwordError = '';
    this.error = '';
    this.isLoading = true;

    const payload = {
      username: this.username,
      password: this.password,
    };

    this.auth.login(payload, this.remember).subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.isLoading = false;

          if (res?.success) {
            this.router.navigateByUrl('/dashboard');
          } else {
            this.usernameError = 'Username is invalid';
            this.passwordError = 'Password is invalid';
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.isLoading = false;
          console.log('LOGIN ERROR BODY => ', err?.error);

          if (err?.status === 401) {
            this.usernameError = 'Username is invalid';
            this.passwordError = 'Password is invalid';
            this.error = '';
          } else {
            this.error =
              err?.error?.message ||
              err?.error?.title ||
              'Something went wrong';
          }

          this.cdr.detectChanges();
        });
      },
    });
  }
}