<?php

namespace App\Http\Requests\Greenhouse;

use Illuminate\Foundation\Http\FormRequest;

class StoreGreenhouseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'location' => ['nullable', 'string', 'max:255'],
        ];
    }
}
