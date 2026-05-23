<?php

namespace App\Http\Requests\AutomationRule;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAutomationRuleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'trigger_sensor_id' => ['sometimes', 'integer', 'exists:sensors,id'],
            'operator' => ['sometimes', 'string', 'in:gt,lt,eq,gte,lte'],
            'threshold' => ['sometimes', 'numeric'],
            'action_device_id' => ['sometimes', 'integer', 'exists:devices,id'],
            'action' => ['sometimes', 'string', 'in:turn_on,turn_off'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
