<?php

namespace App\Http\Requests\Task;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'filled', 'string', 'max:255'],
            'type' => ['sometimes', 'string', 'in:reminder,system_command'],
            'payload' => ['sometimes', 'array'],
            'scheduled_at' => ['sometimes', 'date'],
            'is_completed' => ['sometimes', 'boolean'],
        ];
    }
}
