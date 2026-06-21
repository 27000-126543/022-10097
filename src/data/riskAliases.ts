export const riskTypeAliases: Record<string, string[]> = {
  '孕期或哺乳期': ['孕', '怀孕', '妊娠', '哺乳', '产后', '孕妇', '哺乳期', '孕期'],
  '瘢痕体质': ['瘢痕', '疤痕', '增生性疤痕', '瘢痕疙瘩', '疤痕体质'],
  '近期服药': ['服药', '吃药', '药物', '保健品', '中药', '正在服药', '长期服药'],
  '药物或食物过敏史': ['过敏', '药物过敏', '食物过敏', '抗生素', '麻醉药', '过敏史'],
  '近期注射或手术史': ['注射', '手术', '医美', '近期手术', '近期注射', '手术史', '注射史'],
};

export function matchRiskType(checkedLabel: string, filterKey: string): boolean {
  const labelLower = checkedLabel.toLowerCase();
  const filterLower = filterKey.toLowerCase();

  if (labelLower === filterLower) return true;
  if (labelLower.includes(filterLower) || filterLower.includes(labelLower)) return true;

  const aliases = riskTypeAliases[filterKey];
  if (aliases) {
    if (aliases.some((alias) => labelLower.includes(alias.toLowerCase()))) {
      return true;
    }
  }

  for (const [key, aliasList] of Object.entries(riskTypeAliases)) {
    if (key.toLowerCase() === filterLower || aliasList.some((a) => a.toLowerCase() === filterLower)) {
      if (
        labelLower.includes(key.toLowerCase()) ||
        aliasList.some((alias) => labelLower.includes(alias.toLowerCase()))
      ) {
        return true;
      }
    }
  }

  return false;
}

export function getRiskFilterKeys(): string[] {
  return Object.keys(riskTypeAliases);
}

export function getRiskDisplayLabel(label: string): string {
  const labelLower = label.toLowerCase();
  for (const [key, aliases] of Object.entries(riskTypeAliases)) {
    if (
      key.toLowerCase() === labelLower ||
      aliases.some((a) => a.toLowerCase() === labelLower) ||
      labelLower.includes(key.toLowerCase()) ||
      aliases.some((a) => labelLower.includes(a.toLowerCase()))
    ) {
      return key;
    }
  }
  return label;
}
