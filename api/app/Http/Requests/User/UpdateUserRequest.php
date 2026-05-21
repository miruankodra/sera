<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => [
                'sometimes', 'string', 'email', 'max:255',
                Rule::unique('users', 'email')->ignore($this->user()->id),
            ],
            'timezone' => ['sometimes', 'string', 'timezone'],
            'locale' => ['sometimes', 'string', 'size:2'],
            'notification_preferences' => ['sometimes', 'array'],
            'notification_preferences.alerts' => ['sometimes', 'boolean'],
            'notification_preferences.automation' => ['sometimes', 'boolean'],
            'notification_preferences.tasks' => ['sometimes', 'boolean'],
        ];
    }
}
