<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class UpdatePasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', Password::min(8), 'confirmed'],
        ];
    }

    public function after(): array
    {
        return [
            function () {
                if (! Hash::check($this->current_password, $this->user()->password)) {
                    throw ValidationException::withMessages([
                        'current_password' => [__('auth.password')],
                    ]);
                }
            },
        ];
    }
}
