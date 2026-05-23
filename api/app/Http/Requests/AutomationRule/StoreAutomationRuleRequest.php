<?php

namespace App\Http\Requests\AutomationRule;

use Illuminate\Foundation\Http\FormRequest;

class StoreAutomationRuleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'trigger_sensor_id' => ['required', 'integer', 'exists:sensors,id'],
            'operator' => ['required', 'string', 'in:gt,lt,eq,gte,lte'],
            'threshold' => ['required', 'numeric'],
            'action_device_id' => ['required', 'integer', 'exists:devices,id'],
            'action' => ['required', 'string', 'in:turn_on,turn_off'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
