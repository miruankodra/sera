import {inject, Injectable} from '@angular/core';
import {HttpService} from './http.service';
import {AutomationRuleDto, CreateAutomationRuleDto} from '../models/automation-rule-dto';

interface RuleListResponse {
  data: AutomationRuleDto[];
}

interface RuleResponse {
  data: AutomationRuleDto;
}

@Injectable({providedIn: 'root'})
export class AutomationRuleService {
  private _http = inject(HttpService);

  async getByGreenhouse(greenhouseId: number): Promise<AutomationRuleDto[]> {
    const r = await this._http.get<RuleListResponse>(`greenhouses/${greenhouseId}/automation-rules`);
    return r.data;
  }

  async create(greenhouseId: number, data: CreateAutomationRuleDto): Promise<AutomationRuleDto> {
    const r = await this._http.post<RuleResponse>(`greenhouses/${greenhouseId}/automation-rules`, data);
    return r.data;
  }

  async update(ruleId: number, data: Partial<AutomationRuleDto>): Promise<AutomationRuleDto> {
    const r = await this._http.put<RuleResponse>(`automation-rules/${ruleId}`, data);
    return r.data;
  }

  async delete(ruleId: number): Promise<void> {
    await this._http.delete(`automation-rules/${ruleId}`);
  }
}
