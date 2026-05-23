<?php

namespace App\Http\Requests\Task;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'in:reminder,system_command'],
            'payload' => ['required', 'array'],
            'scheduled_at' => ['required', 'date'],
            'is_completed' => ['sometimes', 'boolean'],
        ];
    }
}
