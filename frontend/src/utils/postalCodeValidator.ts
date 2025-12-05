// 邮政编码验证规则
interface PostalCodeRule {
  pattern: RegExp;
  example: string;
}

// 各国邮政编码规则
const postalCodeRules: Record<string, PostalCodeRule | undefined> = {
  default: {
    pattern: /^\d{5}(-\d{4})?$/,
    example: '12345 或 12345-6789'
  },
  // 中国
  CN: {
    pattern: /^\d{6}$/,
    example: '100000'
  },
  // 美国
  US: {
    pattern: /^\d{5}(-\d{4})?$/,
    example: '12345 或 12345-6789'
  },
  // 英国
  GB: {
    pattern: /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/i,
    example: 'SW1A 1AA'
  },
  // 德国
  DE: {
    pattern: /^\d{5}$/,
    example: '10115'
  },
  // 法国
  FR: {
    pattern: /^\d{5}$/,
    example: '75001'
  },
  // 日本
  JP: {
    pattern: /^\d{3}-\d{4}$/,
    example: '100-0001'
  },
  // 澳大利亚
  AU: {
    pattern: /^\d{4}$/,
    example: '2000'
  },
  // 加拿大
  CA: {
    pattern: /^[A-Z]\d[A-Z] \d[A-Z]\d$/i,
    example: 'M5V 2T6'
  },
  // 俄罗斯
  RU: {
    pattern: /^\d{6}$/,
    example: '101000'
  },
  // 巴西
  BR: {
    pattern: /^\d{5}-\d{3}$/,
    example: '01001-000'
  },
  // 印度
  IN: {
    pattern: /^\d{6}$/,
    example: '110001'
  },
  // 韩国
  KR: {
    pattern: /^\d{5}$/,
    example: '03172'
  },
  // 意大利
  IT: {
    pattern: /^\d{5}$/,
    example: '00100'
  },
  // 西班牙
  ES: {
    pattern: /^\d{5}$/,
    example: '28001'
  },
  // 荷兰
  NL: {
    pattern: /^\d{4} [A-Z]{2}$/i,
    example: '1012 AB'
  },
  // 瑞典
  SE: {
    pattern: /^\d{3} \d{2}$/,
    example: '100 01'
  },
  // 瑞士
  CH: {
    pattern: /^\d{4}$/,
    example: '8000'
  }
};

// 验证邮政编码
export const validatePostalCode = (postalCode: string, countryCode: string): boolean => {
  const rule = postalCodeRules[countryCode] || postalCodeRules.default;
  if (rule) {
    return rule.pattern.test(postalCode);
  }
  return true; // 如果没有规则，默认通过
};

// 获取邮政编码示例
export const getPostalCodeExample = (countryCode: string): string => {
  const rule = postalCodeRules[countryCode] || postalCodeRules.default;
  return rule ? rule.example : '12345';
};

// 生成Element Plus验证规则
export const generatePostalCodeValidator = (countryCode: string) => {
  return [
    {
      required: true,
      message: '请输入邮政编码',
      trigger: 'blur'
    },
    {
      validator: (_rule: any, value: string, callback: any) => {
        if (validatePostalCode(value, countryCode)) {
          callback();
        } else {
          const example = getPostalCodeExample(countryCode);
          callback(new Error(`邮政编码格式不正确，示例：${example}`));
        }
      },
      trigger: 'blur'
    }
  ];
};
