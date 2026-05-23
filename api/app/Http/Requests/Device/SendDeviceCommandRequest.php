<?php

namespace App\Http\Requests\Device;

use Illuminate\Foundation\Http\FormRequest;

class SendDeviceCommandRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'action' => ['required', 'string', 'in:turn_on,turn_off'],
        ];
    }
}
