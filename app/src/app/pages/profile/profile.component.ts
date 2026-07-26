import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {SeTitleComponent} from '../../components/shared/se-title/se-title.component';
import {SeItemComponent} from '../../components/shared/se-item/se-item.component';
import {SeLanguageSwitchComponent} from '../../components/shared/se-language-switch/se-language-switch.component';
import {AuthService} from '../../services/auth.service';
import {UserService} from '../../services/user.service';
import {ToastService} from '../../services/toast.service';
import {TranslationService, AppLocale} from '../../services/translation.service';
import {TranslatePipe} from '../../pipes/translate.pipe';
import {UserDto} from '../../models/user-dto';

interface EditForm { name: string; email: string; }
interface PasswordForm {
  current_password: string;
  password: string;
  password_confirmation: string;
}

@Component({
  selector: 'se-profile',
  standalone: true,
  imports: [SeTitleComponent, SeItemComponent, SeLanguageSwitchComponent, TranslatePipe],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  private _authService  = inject(AuthService);
  private _userService  = inject(UserService);
  private _toastService = inject(ToastService);
  private _translation   = inject(TranslationService);

  user    = signal<UserDto | null>(null);
  loading = signal(true);

  showEditSheet     = signal(false);
  showPasswordSheet = signal(false);
  saving            = signal(false);
  passwordError     = signal('');

  editForm = signal<EditForm>({name: '', email: ''});
  passwordForm = signal<PasswordForm>({
    current_password: '', password: '', password_confirmation: '',
  });

  readonly editFormValid = computed(() => {
    const f = this.editForm();
    return f.name.trim().length > 0 && f.email.trim().length > 0;
  });

  readonly passwordFormValid = computed(() => {
    const f = this.passwordForm();
    return f.current_password.length > 0 &&
           f.password.length >= 8 &&
           f.password === f.password_confirmation;
  });

  readonly notifPrefs = computed(() =>
    this.user()?.notification_preferences ?? {alerts: true, automation: true, tasks: true}
  );

  notifRows(): {key: 'alerts' | 'automation' | 'tasks'; label: string; emoji: string; desc: string; value: boolean}[] {
    const prefs = this.notifPrefs();
    const t = (key: string) => this._translation.translate(key);
    return [
      {key: 'alerts',     label: t('profile.thresholdAlerts'),    emoji: '⚠️', desc: t('profile.thresholdAlertsDesc'),    value: prefs.alerts},
      {key: 'automation', label: t('profile.automationTriggers'), emoji: '⚡', desc: t('profile.automationTriggersDesc'), value: prefs.automation},
      {key: 'tasks',      label: t('profile.taskReminders'),      emoji: '📅', desc: t('profile.taskRemindersDesc'),      value: prefs.tasks},
    ];
  }

  moreItems(): {label: string; emoji: string}[] {
    return [
      {label: this._translation.translate('profile.termsConditions'), emoji: '📄'},
      {label: this._translation.translate('profile.privacyPolicy'),   emoji: '🛡️'},
      {label: this._translation.translate('profile.rateApp'),         emoji: '⭐'},
    ];
  }

  async ngOnInit(): Promise<void> {
    try {
      const profile = await this._userService.getProfile();
      this.user.set(profile);
      await this._translation.syncFromAccount(profile.locale);
    } finally {
      this.loading.set(false);
    }
  }

  async onLanguageChanged(locale: AppLocale): Promise<void> {
    try {
      const updated = await this._userService.updateProfile({locale});
      this.user.set(updated);
    } catch {
      // local preference already applied; account sync is best-effort
    }
  }

  avatarUrl(): string {
    const u = this.user();
    if (u?.avatar_url) return u.avatar_url;
    const name = u?.name ?? this._translation.translate('profile.defaultUserName');
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=C4FE33&color=0B3931&size=128`;
  }

  openEditSheet(): void {
    const u = this.user();
    this.editForm.set({name: u?.name ?? '', email: u?.email ?? ''});
    this.showEditSheet.set(true);
  }

  patchEdit(patch: Partial<EditForm>): void {
    this.editForm.update(f => ({...f, ...patch}));
  }

  onEditName(event: Event): void {
    this.patchEdit({name: (event.target as HTMLInputElement).value});
  }

  onEditEmail(event: Event): void {
    this.patchEdit({email: (event.target as HTMLInputElement).value});
  }

  onCurrentPassword(event: Event): void {
    this.patchPassword({current_password: (event.target as HTMLInputElement).value});
  }

  onNewPassword(event: Event): void {
    this.patchPassword({password: (event.target as HTMLInputElement).value});
  }

  onConfirmPassword(event: Event): void {
    this.patchPassword({password_confirmation: (event.target as HTMLInputElement).value});
  }

  async saveProfile(): Promise<void> {
    if (!this.editFormValid()) return;
    this.saving.set(true);
    try {
      const updated = await this._userService.updateProfile(this.editForm());
      this.user.set(updated);
      this.showEditSheet.set(false);
      await this._toastService.fireToast(this._translation.translate('profile.profileUpdated'));
    } catch {
      await this._toastService.fireToast(this._translation.translate('profile.profileUpdateFailed'));
    } finally {
      this.saving.set(false);
    }
  }

  openPasswordSheet(): void {
    this.passwordForm.set({current_password: '', password: '', password_confirmation: ''});
    this.passwordError.set('');
    this.showPasswordSheet.set(true);
  }

  patchPassword(patch: Partial<PasswordForm>): void {
    this.passwordForm.update(f => ({...f, ...patch}));
    this.passwordError.set('');
  }

  async savePassword(): Promise<void> {
    if (!this.passwordFormValid()) return;
    this.saving.set(true);
    this.passwordError.set('');
    try {
      await this._userService.changePassword(this.passwordForm());
      this.showPasswordSheet.set(false);
      await this._toastService.fireToast(this._translation.translate('profile.passwordChanged'));
    } catch {
      this.passwordError.set(this._translation.translate('profile.incorrectCurrentPassword'));
    } finally {
      this.saving.set(false);
    }
  }

  async toggleNotif(key: 'alerts' | 'automation' | 'tasks'): Promise<void> {
    const current = this.notifPrefs();
    const updated = {...current, [key]: !current[key]};
    this.user.update(u => u ? {...u, notification_preferences: updated} : u);
    try {
      await this._userService.updateProfile({notification_preferences: updated});
    } catch {
      this.user.update(u => u ? {...u, notification_preferences: current} : u);
    }
  }

  async logout(): Promise<void> {
    await this._authService.logout();
  }
}
