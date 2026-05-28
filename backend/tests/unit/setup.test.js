'use strict';

const fs = require('fs');
const path = require('path');

const BACKEND_ROOT = path.join(__dirname, '../..');
const pkg = require(path.join(BACKEND_ROOT, 'package.json'));

// ────────────────────────────────────────────────────────────────
// 1. package.json 검증
// ────────────────────────────────────────────────────────────────
describe('package.json 검증', () => {
  const REQUIRED_DEPS = ['express', 'pg', 'bcryptjs', 'jsonwebtoken', 'dotenv', 'cors'];
  const REQUIRED_DEV_DEPS = ['jest', 'supertest', 'eslint', 'prettier'];
  const REQUIRED_SCRIPTS = ['dev', 'test', 'lint', 'format'];

  test.each(REQUIRED_DEPS)(
    'dependencies에 "%s" 가 존재해야 한다',
    (dep) => {
      expect(pkg.dependencies).toHaveProperty(dep);
    }
  );

  test.each(REQUIRED_DEV_DEPS)(
    'devDependencies에 "%s" 가 존재해야 한다',
    (dep) => {
      expect(pkg.devDependencies).toHaveProperty(dep);
    }
  );

  test.each(REQUIRED_SCRIPTS)(
    'scripts에 "%s" 가 존재해야 한다',
    (script) => {
      expect(pkg.scripts).toHaveProperty(script);
    }
  );
});

// ────────────────────────────────────────────────────────────────
// 2. 설정 파일 존재 검증
// ────────────────────────────────────────────────────────────────
describe('설정 파일 존재 검증', () => {
  test('.env.example 파일이 존재해야 한다', () => {
    const filePath = path.join(BACKEND_ROOT, '.env.example');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  test('jest.config.js 파일이 존재해야 한다', () => {
    const filePath = path.join(BACKEND_ROOT, 'jest.config.js');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  test('.gitignore 파일이 존재해야 한다', () => {
    const filePath = path.join(BACKEND_ROOT, '.gitignore');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  test('.gitignore에 ".env" 가 포함되어 있어야 한다', () => {
    const filePath = path.join(BACKEND_ROOT, '.gitignore');
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('.env');
  });
});

// ────────────────────────────────────────────────────────────────
// 3. 디렉토리 구조 검증
// ────────────────────────────────────────────────────────────────
describe('디렉토리 구조 검증', () => {
  const REQUIRED_DIRS = [
    'src/routes',
    'src/controllers',
    'src/services',
    'src/middleware',
    'src/db',
    'src/lib',
    'src/utils',
    'src/constants',
    'tests/integration',
    'tests/unit',
    'tests/helpers',
  ];

  test.each(REQUIRED_DIRS)(
    '"%s" 디렉토리가 존재해야 한다',
    (dir) => {
      const dirPath = path.join(BACKEND_ROOT, dir);
      expect(fs.existsSync(dirPath)).toBe(true);
      expect(fs.statSync(dirPath).isDirectory()).toBe(true);
    }
  );
});
