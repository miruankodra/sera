<?php

namespace App\Http\Requests\Sensor;

use Illuminate\Foundation\Http\FormRequest;

class StoreSensorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'max:255'],
            'unit' => ['required', 'string', 'max:50'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
